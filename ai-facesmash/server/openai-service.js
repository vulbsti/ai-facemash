/**
 * OpenAI Service for AI-Facesmash application
 */
const { OpenAI } = require('openai');
const fs = require('fs');
const { systemPrompt, rateSelfPrompts, compareFriendsPrompts } = require('./prompts');

// Constants for stream handling
const STREAM_TIMEOUT = 50000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 1 second

// Initialize OpenAI client with API key from environment variable for better security
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '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'
});

// Helper function to encode image to base64 from file path
function encodeImageToBase64(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  return imageBuffer.toString('base64');
}

// Helper function to encode buffer directly to base64
function encodeBufferToBase64(buffer) {
  return buffer.toString('base64');
}

/**
 * Handles streaming of OpenAI response with improved error handling
 * @param {object} stream - OpenAI response stream
 * @param {object} res - Express response object
 * @returns {Promise<void>}
 */
async function handleStreamResponse(stream, res) {
  let streamTimeout;
  let buffer = '';


  try {
    // Set timeout for entire stream
    const timeoutPromise = new Promise((_, reject) => {
      streamTimeout = setTimeout(() => {
        reject(new Error('Stream timeout'));
      }, STREAM_TIMEOUT);
    });

    // Handle the stream with timeout
    await Promise.race([
      (async () => {
        for await (const chunk of stream) {
          if (res.closed) {
            throw new Error('Client disconnected');
          }

          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            buffer += content;
            
            // Send buffered content when we have a complete sentence or substantial content
            if (content.match(/[.!?]\s*$/) || buffer.length > 50 || content.includes('\n')) {
              res.write(buffer);
              buffer = '';
            }
          }
        }
        // Send any remaining buffered content
        if (buffer) {
          res.write(buffer);
        }
      })(),
      timeoutPromise
    ]);

  } catch (error) {
    console.error('Stream error:', error);
    // Send error message only if client is still connected
    if (!res.closed) {
      res.write('\n\nError: Connection interrupted. Please try again.');
    }
    throw error;
  } finally {
    clearTimeout(streamTimeout);
    if (!res.closed) {
      res.end();
    }
  }
}

/**
 * Process with retry logic
 */
async function processWithRetry(processFn) {
  let lastError;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await processFn();
      return;
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt} failed:`, error);
      
      if (attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
      }
    }
  }
  
  throw lastError;
}

/**
 * Process a single image buffer for "Rate Self" functionality
 * @param {Buffer} imageBuffer - Buffer of the uploaded image
 * @param {string} mimetype - MIME type of the uploaded image
 * @param {string} ratingType - Type of rating to request
 * @param {string} gender - Gender selection ('male' or 'female')
 * @param {object} res - Express response object for streaming
 */
async function processRateSelfBuffer(imageBuffer, mimetype, ratingType, gender, res) {
  await processWithRetry(async () => {
    const base64Image = encodeBufferToBase64(imageBuffer);
    
    // Get gender-specific prompt or fallback to default (male)
    const promptsByType = rateSelfPrompts[ratingType] || rateSelfPrompts.rate;
    const prompt = (gender && promptsByType[gender]) ? promptsByType[gender] : promptsByType.male;
    
    const stream = await openai.chat.completions.create({
      model: "chatgpt-4o-latest",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimetype};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 4000,
      stream: true, 
          
    });

    await handleStreamResponse(stream, res);
  });
}

/**
 * Process multiple image buffers for "Compare Friends" functionality
 * @param {Array} imageBuffers - Array of objects containing buffer and mimetype
 * @param {string} ratingType - Type of rating to request
 * @param {string} gender - Gender selection ('male' or 'female')
 * @param {object} res - Express response object for streaming
 */
async function processCompareFriendsBuffers(imageBuffers, ratingType, gender, res) {
  await processWithRetry(async () => {
    // Get gender-specific prompt or fallback to default (male)
    const promptsByType = compareFriendsPrompts[ratingType] || compareFriendsPrompts.rate;
    const prompt = (gender && promptsByType[gender]) ? promptsByType[gender] : promptsByType.male;
    
    // Create content array with all images
    const content = [
      { type: "text", text: prompt }
    ];
    
    // Add each image to the content array
    imageBuffers.forEach(img => {
      const base64Image = encodeBufferToBase64(img.buffer);
      content.push({
        type: "image_url",
        image_url: {
          url: `data:${img.mimetype};base64,${base64Image}`
        }
      });
    });
    
    const stream = await openai.chat.completions.create({
      model: "chatgpt-4o-latest",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: content
        }
      ],
      max_tokens: 4000,
      stream: true,
    
    });

    await handleStreamResponse(stream, res);
  });
}

// Keep existing methods for backward compatibility
async function processRateSelf(imagePath, ratingType, gender, res) {
  try {
    const base64Image = encodeImageToBase64(imagePath);
    const imageBuffer = fs.readFileSync(imagePath);
    const mimetype = 'image/jpeg'; // Default assumption
    
    return processRateSelfBuffer(imageBuffer, mimetype, ratingType, gender, res);
  } catch (error) {
    console.error('Error in processRateSelf:', error);
    res.write('Error: Unable to process your request. Please try again later.');
    res.end();
  }
}

async function processCompareFriends(imagePaths, ratingType, gender, res) {
  try {
    const imageBuffers = imagePaths.map(path => ({
      buffer: fs.readFileSync(path),
      mimetype: 'image/jpeg' // Default assumption
    }));
    
    return processCompareFriendsBuffers(imageBuffers, ratingType, gender, res);
  } catch (error) {
    console.error('Error in processCompareFriends:', error);
    res.write('Error: Unable to process your request. Please try again later.');
    res.end();
  }
}

module.exports = {
  processRateSelf,
  processCompareFriends,
  processRateSelfBuffer,
  processCompareFriendsBuffers
};