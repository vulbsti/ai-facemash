/**
 * Main server file for AI-Facesmash application
 */
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const apiRoutes = require('./api-routes');

// Load environment variables
dotenv.config();

// Debug: Log environment variables
console.log("Environment variables loaded:");
console.log("PORT:", process.env.PORT);
console.log("OPENAI_API_KEY exists:", !!process.env.OPENAI_API_KEY);
if (process.env.OPENAI_API_KEY) {
  console.log("OPENAI_API_KEY length:", process.env.OPENAI_API_KEY.length);
  console.log("OPENAI_API_KEY first 5 chars:", process.env.OPENAI_API_KEY.substring(0, 5));
}

// Create Express application
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api', apiRoutes);

// Default route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});