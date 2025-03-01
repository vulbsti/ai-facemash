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
    console.log("Image file metadata:", {
      filename: imageFile.filename,
      mimeType: imageFile.mimetype,
      bufferLength: imageFile.buffer.length
    });
    
    const mimeType = imageFile.mimetype || 'image/jpeg';
    const base64Image = imageFile.buffer.toString('base64');
    
    // Get gender-specific prompt or fallback to default (male)
    const promptsByType = rateSelfPrompts[ratingType] || rateSelfPrompts.rate;
    const prompt = (gender && promptsByType[gender]) ? promptsByType[gender] : promptsByType.male;

    console.log("Using model: gpt-4-vision-preview");

    try {
      const completion = await openai.chat.completions.create({
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
                  url: `data:${mimeType};base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 4000
      });

      const result = completion.choices[0].message.content;
      console.log("Got successful result from OpenAI");
      
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result })
      };
    } catch (apiError) {
      console.error("OpenAI API error:", apiError);
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: 'OpenAI API error: ' + (apiError.message || 'Unknown error'),
          error: apiError.toString()
        })
      };
    }
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
  // For debugging
  console.log("Headers:", JSON.stringify(event.headers));
  console.log("Is Base64 Encoded:", event.isBase64Encoded);
  console.log("Body length:", event.body ? event.body.length : 0);
  
  // Handle form data directly with a simpler approach
  if (event.isBase64Encoded) {
    try {
      // Create a raw buffer from the base64 body
      const rawBody = Buffer.from(event.body, 'base64');
      
      // For multipart form data, we need to find boundaries
      const contentType = event.headers['content-type'] || event.headers['Content-Type'];
      
      if (!contentType || !contentType.includes('multipart/form-data')) {
        throw new Error('Not a multipart form submission');
      }
      
      // For debugging only
      console.log("Content type:", contentType);
      
      // Extract boundary
      const boundary = contentType.split('boundary=')[1].trim();
      console.log("Boundary:", boundary);
      
      // Parse the form data manually
      const parts = extractFormParts(rawBody, boundary);
      
      return {
        fields: parts.fields,
        files: parts.files
      };
    } catch (error) {
      console.error("Error parsing form data:", error);
      throw error;
    }
  } else {
    console.log("Request is not base64 encoded - using busboy");
    
    // Fall back to busboy if not base64 encoded
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
      parser.write(Buffer.from(event.body, 'utf8'));
      parser.end();
    });
  }
}

// Helper function to extract form parts from multipart data
function extractFormParts(buffer, boundary) {
  const boundaryBuffer = Buffer.from('--' + boundary);
  const endBoundaryBuffer = Buffer.from('--' + boundary + '--');
  
  const fields = {};
  const files = {};
  
  // Split buffer by boundary
  let start = 0;
  let end = buffer.indexOf(boundaryBuffer);
  
  while (end !== -1) {
    // Move start past the boundary
    start = end + boundaryBuffer.length;
    
    // Find the next boundary
    end = buffer.indexOf(boundaryBuffer, start);
    if (end === -1) {
      // If no more boundaries, check for end boundary
      end = buffer.indexOf(endBoundaryBuffer, start);
      if (end === -1) break; // No more parts
    }
    
    // Extract part content (excluding CRLF after boundary)
    const part = buffer.slice(start + 2, end);
    
    // Parse headers and content
    const headerEnd = part.indexOf(Buffer.from('\r\n\r\n'));
    if (headerEnd !== -1) {
      const headerStr = part.slice(0, headerEnd).toString();
      const content = part.slice(headerEnd + 4);
      
      // Parse headers
      const headers = {};
      headerStr.split('\r\n').forEach(line => {
        const [name, value] = line.split(':').map(s => s.trim());
        if (name && value) headers[name.toLowerCase()] = value;
      });
      
      // Check for Content-Disposition
      const disposition = headers['content-disposition'];
      if (disposition) {
        // Extract name and filename
        const nameMatch = disposition.match(/name="([^"]+)"/);
        const filenameMatch = disposition.match(/filename="([^"]+)"/);
        
        if (nameMatch) {
          const name = nameMatch[1];
          
          if (filenameMatch) {
            // This is a file
            files[name] = {
              buffer: content,
              filename: filenameMatch[1],
              mimetype: headers['content-type'] || 'application/octet-stream'
            };
          } else {
            // This is a field
            fields[name] = content.toString().trim();
          }
        }
      }
    }
  }
  
  return { fields, files };
}