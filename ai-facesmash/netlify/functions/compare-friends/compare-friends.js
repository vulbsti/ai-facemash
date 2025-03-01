const multer = require('multer');
const { OpenAI } = require('openai');
const { systemPrompt, compareFriendsPrompts } = require('../../../server/prompts');
const serverless = require('serverless-http');
const express = require('express');

// Initialize the app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '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'
});

// Use memory storage for multer
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

// Process compare friends request
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

// Handle POST request
app.post('/', upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log("Compare Friends handler called");
    
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
});

// Export the serverless function
exports.handler = serverless(app);