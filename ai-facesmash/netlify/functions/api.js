const express = require('express');
const serverless = require('serverless-http');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { OpenAI } = require('openai');
const { systemPrompt, rateSelfPrompts, compareFriendsPrompts } = require('../../server/prompts');

// Initialize express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Use memory storage for Netlify functions since we can't write to disk
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Helper function to encode image buffer to base64
function encodeImageBufferToBase64(buffer) {
  return buffer.toString('base64');
}

/**
 * Process a single image for "Rate Self" functionality
 */
async function processRateSelf(imageBuffer, ratingType, gender, res) {
  try {
    const base64Image = encodeImageBufferToBase64(imageBuffer);
    
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

    // Return the first chunk of content
    let fullResponse = '';
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
      }
    }
    
    return fullResponse;
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw new Error('Unable to process your request');
  }
}

/**
 * Process multiple images for "Compare Friends" functionality
 */
async function processCompareFriends(imageBuffers, ratingType, gender) {
  try {
    // Get gender-specific prompt or fallback to default (male)
    const promptsByType = compareFriendsPrompts[ratingType] || compareFriendsPrompts.rate;
    const prompt = (gender && promptsByType[gender]) ? promptsByType[gender] : promptsByType.male;
    
    // Create content array with all images
    const content = [
      { type: "text", text: prompt }
    ];
    
    // Add each image to the content array
    imageBuffers.forEach(buffer => {
      const base64Image = encodeImageBufferToBase64(buffer);
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

    // Collect the full response
    let fullResponse = '';
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
      }
    }
    
    return fullResponse;
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw new Error('Unable to process your request');
  }
}

// Rate Self endpoint
app.post('/rate-self', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const ratingType = req.body.ratingType || 'rate';
    const gender = req.body.gender || 'male';
    
    const result = await processRateSelf(req.file.buffer, ratingType, gender);
    res.json({ result });
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ message: 'An error occurred while processing your image' });
  }
});

// Compare Friends endpoint
app.post('/compare-friends', upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 }
]), async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length < 2) {
      return res.status(400).json({ message: 'At least two images must be uploaded' });
    }

    const ratingType = req.body.ratingType || 'rate';
    const gender = req.body.gender || 'male';
    
    // Extract image buffers
    const imageBuffers = Object.values(req.files).map(fileArr => fileArr[0].buffer);
    
    const result = await processCompareFriends(imageBuffers, ratingType, gender);
    res.json({ result });
  } catch (error) {
    console.error('Error processing images:', error);
    res.status(500).json({ message: 'An error occurred while processing your images' });
  }
});

// Export the serverless function
exports.handler = serverless(app);