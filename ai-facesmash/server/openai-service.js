/**
 * OpenAI Service for AI-Facesmash application
 */
const { OpenAI } = require('openai');
const fs = require('fs');
const { systemPrompt, rateSelfPrompts, compareFriendsPrompts } = require('./prompts');

// Initialize OpenAI client with the API key directly instead of using environment variables
const openai = new OpenAI({
  apiKey: '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'
});

// Helper function to encode image to base64
function encodeImageToBase64(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  return imageBuffer.toString('base64');
}

/**
 * Process a single image for "Rate Self" functionality
 * @param {string} imagePath - Path to the uploaded image
 * @param {string} ratingType - Type of rating to request
 * @param {string} gender - Gender selection ('male' or 'female')
 * @param {object} res - Express response object for streaming
 */
async function processRateSelf(imagePath, ratingType, gender, res) {
  try {
    const base64Image = encodeImageToBase64(imagePath);
    
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
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 4000,
      stream: true
    });

    // Stream the response back to the client
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(content);
      }
    }

    res.end();
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    res.write('Error: Unable to process your request. Please try again later.');
    res.end();
  }
}

/**
 * Process multiple images for "Compare Friends" functionality
 * @param {string[]} imagePaths - Paths to the uploaded images
 * @param {string} ratingType - Type of rating to request
 * @param {string} gender - Gender selection ('male' or 'female')
 * @param {object} res - Express response object for streaming
 */
async function processCompareFriends(imagePaths, ratingType, gender, res) {
  try {
    // Get gender-specific prompt or fallback to default (male)
    const promptsByType = compareFriendsPrompts[ratingType] || compareFriendsPrompts.rate;
    const prompt = (gender && promptsByType[gender]) ? promptsByType[gender] : promptsByType.male;
    
    // Create content array with all images
    const content = [
      { type: "text", text: prompt }
    ];
    
    // Add each image to the content array
    imagePaths.forEach(path => {
      const base64Image = encodeImageToBase64(path);
      content.push({
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${base64Image}`
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
      stream: true
    });

    // Stream the response back to the client
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(content);
      }
    }

    res.end();
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    res.write('Error: Unable to process your request. Please try again later.');
    res.end();
  }
}

module.exports = {
  processRateSelf,
  processCompareFriends
};