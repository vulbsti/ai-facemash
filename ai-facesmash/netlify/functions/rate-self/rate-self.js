const multer = require('multer');
const { OpenAI } = require('openai');
const { systemPrompt, rateSelfPrompts } = require('../../../server/prompts');
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

// Process rate-self request
async function processRateSelf(imageBuffer, ratingType, gender) {
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

// Handle POST request
app.post('/', upload.single('image'), async (req, res) => {
  try {
    console.log("Rate Self handler called");
    
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
});

// Export the serverless function
exports.handler = serverless(app);