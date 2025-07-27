# AI-Powered Facesmash Web App

## Overview
This application is an AI-powered version of Facesmash that uses the ChatGPT API to provide ratings, feedback, and comparisons of uploaded photos. The app features a minimal JavaScript design with few external dependencies and offers two main functionalities: "Rate Self" and "Compare Friends."

## Features
- **Rate Self**: Upload a single photo for AI analysis
- **Compare Friends**: Upload up to 4 photos for AI comparison
- Multiple rating options: standard rating, unhinged rating, feedback, and roast
- Markdown rendering of AI responses
- Real-time streaming of AI responses in a chat-like interface
- Secure image handling and storage

## Tech Stack

### Frontend
- **HTML5/CSS3**: Basic structure and styling
- **Vanilla JavaScript**: Core functionality
- **Libraries**:
  - **marked.js**: For Markdown parsing and rendering
  - **FontAwesome**: For icons (particularly the '+' icon)
  - **Fetch API**: For handling API requests (built into modern browsers)
  - **FileReader API**: For handling file uploads (built into modern browsers)

### Backend
- **Node.js**: Server environment
- **Express.js**: Web server framework
- **Multer**: Middleware for handling multipart/form-data (file uploads)
- **OpenAI API Client**: For ChatGPT integration
- **dotenv**: For environment variable management

## Application Structure

```
/ai-facesmash
├── /public
│   ├── /css
│   │   └── style.css
│   ├── /js
│   │   ├── main.js
│   │   ├── rate-self.js
│   │   └── compare-friends.js
│   ├── /libs
│   │   └── marked.min.js
│   ├── index.html
│   ├── rate-self.html
│   └── compare-friends.html
├── /server
│   ├── /uploads
│   ├── server.js
│   ├── api-routes.js
│   └── openai-service.js
├── .env
├── package.json
└── README.md
```

## Setup and Installation

### Prerequisites
- Node.js (v14 or higher)
- NPM (v6 or higher)
- OpenAI API key

### Installation Steps
1. Clone the repository
2. Run `npm install` to install dependencies
3. Create a `.env` file with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   PORT=3000
   ```
4. Run `npm start` to start the server
5. Access the application at `http://localhost:3000`

## API Endpoints

### Upload and Process "Rate Self" Image
- **URL**: `/api/rate-self`
- **Method**: `POST`
- **Body**: Form data with image file and rating type
- **Response**: Streaming markdown-formatted AI response

### Upload and Process "Compare Friends" Images
- **URL**: `/api/compare-friends`
- **Method**: `POST`
- **Body**: Form data with up to 4 image files and rating type
- **Response**: Streaming markdown-formatted AI response

## Frontend Pages

### Home Page (index.html)
- Simple landing page with two options:
  - "Rate Self" button
  - "Compare Friends" button
- Minimal styling, focused on user choice

### Rate Self Page (rate-self.html)
- Image upload area with preview
- Upload button with '+ Upload' icon
- Rating option buttons:
  - Rate
  - Rate-Unhinged
  - Feedback
  - Roast-Me-Dead
- Response display area (scrollable chat-like interface)

### Compare Friends Page (compare-friends.html)
- Four image upload areas with preview
- Each area has '+ Upload' icon when empty
- Same rating option buttons as Rate Self page
- Response display area (scrollable chat-like interface)

## ChatGPT Prompts

### Rate Self Prompts
- **Rate**: "Please provide an objective rating of this person's appearance on a scale of 1-10 with a brief explanation."
- **Rate-Unhinged**: "Provide an exaggerated but entertaining rating of this person's appearance with creative commentary."
- **Feedback**: "Offer constructive feedback about this person's appearance with positive suggestions."
- **Roast-Me-Dead**: "Provide a humorous roast of this person's appearance with witty observations."

### Compare Friends Prompts
- **Rate**: "Compare these people objectively on appearance and provide ratings for each on a scale of 1-10."
- **Rate-Unhinged**: "Compare these people with exaggerated, entertaining commentary on their appearances."
- **Feedback**: "Provide constructive feedback for each person with positive suggestions."
- **Roast-Me-Dead**: "Humorously roast each person with witty observations about their appearances."

## Implementation Details

### Image Handling
1. Images are uploaded through file input elements
2. Client-side preview using FileReader API
3. Images sent to server using FormData and fetch API
4. Server stores images temporarily in '/uploads' directory
5. Images sent to OpenAI API using base64 encoding

### API Integration
1. Server forwards images to OpenAI's GPT-4 Vision API
2. Appropriate prompt is selected based on user's button choice
3. API responses are streamed back to client
4. Client renders markdown responses in real-time

### Response Rendering
1. AI responses received as markdown text
2. marked.js library converts markdown to HTML
3. HTML inserted into response container
4. Auto-scroll functionality keeps latest responses visible

## Deployment
- The application can be deployed to services like:
  - Heroku
  - Vercel
  - AWS Elastic Beanstalk
  - Google Cloud Run
- Make sure to set environment variables in your deployment platform

## Security Considerations
- Implement rate limiting to prevent API abuse
- Add user authentication for production use
- Set maximum file size limits
- Validate file types (accept only images)
- Implement CSRF protection
- Set proper CORS policies
- Consider implementing image moderation

## Future Enhancements
- User accounts and saved results
- Share results on social media
- More detailed AI analysis options
- Face detection preprocessing
- Mobile app version
