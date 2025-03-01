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

// Debug logger middleware
app.use((req, res, next) => {
  console.log(`[DEBUG] Received ${req.method} request to ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers));
  next();
});

// Set up OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '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'
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

// Test endpoint to verify function is working
app.get('/', (req, res) => {
  res.status(200).json({ message: 'API is working' });
});

// Rate Self endpoint - handle different paths
app.post('/rate-self', upload.single('image'), handleRateSelf);
app.post('/api/rate-self', upload.single('image'), handleRateSelf);

// Compare Friends endpoint - handle different paths
app.post('/compare-friends', upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 }
]), handleCompareFriends);

app.post('/api/compare-friends', upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 }
]), handleCompareFriends);

// Handler function for rate-self endpoint
async function handleRateSelf(req, res) {
  try {
    console.log("Rate Self handler called");
    console.log("Request body:", req.body);
    console.log("Request file:", req.file ? "File uploaded" : "No file");
    
    if (!req.file) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const ratingType = req.body.ratingType || 'rate';
    const gender = req.body.gender || 'male';
    
    console.log(`Processing rate-self: ratingType=${ratingType}, gender=${gender}`);
    
    const result = await processRateSelf(req.file.buffer, ratingType, gender);
    
    // Ensure content type is set to application/json
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ result });
  } catch (error) {
    console.error('Error processing image:', error);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ message: 'An error occurred while processing your image' });
  }
}

// Handler function for compare-friends endpoint
async function handleCompareFriends(req, res) {
  try {
    console.log("Compare Friends handler called");
    console.log("Request body:", req.body);
    console.log("Request files:", req.files ? Object.keys(req.files).length + " files uploaded" : "No files");
    
    if (!req.files || Object.keys(req.files).length < 2) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(400).json({ message: 'At least two images must be uploaded' });
    }

    const ratingType = req.body.ratingType || 'rate';
    const gender = req.body.gender || 'male';
    
    console.log(`Processing compare-friends: ratingType=${ratingType}, gender=${gender}`);
    
    // Extract image buffers
    const imageBuffers = Object.values(req.files).map(fileArr => fileArr[0].buffer);
    
    const result = await processCompareFriends(imageBuffers, ratingType, gender);
    
    // Ensure content type is set to application/json
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ result });
  } catch (error) {
    console.error('Error processing images:', error);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ message: 'An error occurred while processing your images' });
  }
}

// Export the serverless function
exports.handler = serverless(app);