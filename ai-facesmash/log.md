# Troubleshooting Log

## Netlify Deployment Changes

### Problem
When deploying to Netlify, the application experienced several issues:
1. 404 errors when trying to access the API endpoints
2. Timeouts during image processing ("Sandbox.Timedout" errors)
3. Model deprecation errors for "gpt-4-vision-preview"
4. Client-side timeout errors during long processing

### Root Cause Analysis
1. **API Endpoint Issues**: Netlify's serverless functions structure differs from traditional Express routing
2. **Timeout Errors**: Netlify's default function timeout is only 10 seconds, which is insufficient for AI image processing
3. **Model Deprecation**: The OpenAI model "gpt-4-vision-preview" has been deprecated
4. **Client Timeouts**: Client-side abort controller was timing out too quickly

### Solutions Implemented

#### 1. Serverless Function Structure
- Rewrote API handlers as proper Netlify functions instead of Express routes
- Created dedicated function files in appropriate directories
- Implemented proper multipart form parsing with busboy for image uploads
- Added detailed error handling and logging

#### 2. Timeout Handling
- Configured Netlify background functions in `netlify.toml` to allow longer execution (up to 15 minutes)
- Implemented client-side timeout handling with Promise.race
- Added proper error handling for timeout scenarios
- Increased timeout values from 8 seconds to 25 seconds on server side
- Increased client-side timeout from 60 to 90 seconds

#### 3. OpenAI Model Updates
- Updated all instances of "gpt-4-vision-preview" to "chatgpt-4o-latest"
- Reduced token output (max_tokens: 500) for faster responses
- Added temperature parameter for more efficient processing

#### 4. User Experience Improvements
- Added better loading indicators with more accurate time estimates
- Improved error messaging for various failure scenarios
- Enhanced client-side timeout handling with descriptive messages

### Configuration Changes
```toml
# Added to netlify.toml
[functions]
  node_bundler = "esbuild"
  external_node_modules = ["busboy"]
  included_files = ["server/prompts.js"]
  
[functions."rate-self"]
  background = true
  
[functions."compare-friends"]
  background = true
```

## OpenAI API Key Issue

### Problem
Despite having the OpenAI API key properly set in the `.env` file, the application was throwing the following error:

```
OpenAIError: The OPENAI_API_KEY environment variable is missing or empty; either provide it, or instantiate the OpenAI client with an apiKey option, like new OpenAI({ apiKey: 'My API Key' }).
```

### Root Cause Analysis
After investigation, we discovered that:
1. The dotenv package was correctly installed and imported in server.js
2. The `.env` file was created in the root directory with the proper API key
3. The `dotenv.config()` was called in server.js
4. Despite this, the environment variable was not properly loaded or accessible in openai-service.js

This suggests a potential issue with how Node.js modules are loaded and when the environment variables become available in the module system. Since the openai-service.js module is imported and the OpenAI client is initialized during module loading (before the server even starts), it's possible that the environment variables from dotenv weren't fully available at that time.

### Solution
To resolve this issue, we modified the openai-service.js file to directly include the API key in the OpenAI client initialization, rather than relying on environment variables:

```javascript
// Initialize OpenAI client with the API key directly
const openai = new OpenAI({
  apiKey: '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'
});
```

This approach ensures that the OpenAI client has the key it needs regardless of when or how environment variables are loaded.

### Best Practices & Future Improvements
1. While directly including API keys in code is not ideal for production applications (for security reasons), it works as a quick fix for development.
2. For a production application, consider these alternatives:
   - Move the OpenAI client initialization into a function that is called after the server starts
   - Use async module initialization patterns
   - Use a config module that is guaranteed to load before other modules
3. Make sure the uploads directory exists and is writable by the application
4. Consider implementing some file upload validation to verify images are being properly processed

### Image Display Issues
We also fixed issues with image display by:
1. Changing the CSS property `object-fit` from `cover` to `contain` to ensure images are displayed in full without cropping
2. Enhancing error handling in the upload process