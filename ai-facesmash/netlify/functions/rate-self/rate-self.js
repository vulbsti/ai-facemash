const multer = require('multer');
const { OpenAI } = require('openai');
const { systemPrompt, rateSelfPrompts } = require('../../../server/prompts');

// Set up OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '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'
});

// Helper function to encode image buffer to base64
function encodeImageBufferToBase64(buffer) {
  return buffer.toString('base64');
}

// Netlify serverless function handler
exports.handler = async function(event, context) {
  // Only allow POST method
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Method Not Allowed' })
    };
  }

  try {
    console.log("Rate Self handler called");
    
    // Parse the multipart form data
    const { fields, files } = await parseMultipartForm(event);
    
    // Get the image file
    const imageFile = files.image;
    
    if (!imageFile || !imageFile.buffer) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'No image uploaded' })
      };
    }
    
    // Get parameters from form
    const ratingType = fields.ratingType || 'rate';
    const gender = fields.gender || 'male';
    
    console.log(`Processing rate-self: ratingType=${ratingType}, gender=${gender}`);
    
    // Process the image
    const base64Image = imageFile.buffer.toString('base64');
    
    // Get gender-specific prompt or fallback to default (male)
    const promptsByType = rateSelfPrompts[ratingType] || rateSelfPrompts.rate;
    const prompt = (gender && promptsByType[gender]) ? promptsByType[gender] : promptsByType.male;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
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
      max_tokens: 4000
    });

    const result = completion.choices[0].message.content;
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result })
    };
  } catch (error) {
    console.error('Error processing image:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'An error occurred while processing your image' })
    };
  }
};

// Parse multipart form data
async function parseMultipartForm(event) {
  const busboy = require('busboy');
  
  return new Promise((resolve, reject) => {
    const fields = {};
    const files = {};
    
    // Create busboy parser
    const parser = busboy({ headers: event.headers });
    
    // Handle form fields
    parser.on('field', (fieldname, value) => {
      fields[fieldname] = value;
    });
    
    // Handle file uploads
    parser.on('file', (fieldname, fileStream, fileInfo) => {
      const chunks = [];
      
      fileStream.on('data', function(chunk) {
        chunks.push(chunk);
      });
      
      fileStream.on('end', function() {
        const buffer = Buffer.concat(chunks);
        
        files[fieldname] = {
          buffer,
          filename: fileInfo.filename,
          mimetype: fileInfo.mimeType
        };
      });
    });
    
    // Finish parsing
    parser.on('finish', () => {
      resolve({ fields, files });
    });
    
    parser.on('error', (error) => {
      reject(error);
    });
    
    // Pass the request body to busboy
    parser.write(Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8'));
    parser.end();
  });
}