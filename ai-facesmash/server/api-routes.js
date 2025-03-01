/**
 * API Routes for AI-Facesmash application
 */
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const openaiService = require('./openai-service');
const { v4: uuidv4 } = require('uuid');
const redis = require('./redis-config');

// Configure multer for file uploads (using memory storage for Vercel)
const storage = multer.memoryStorage();

// File filter to only accept images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB limit
  }
});

// Rate Self endpoint
router.post('/rate-self', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }
    const ratingType = req.body.ratingType || 'rate';
    const gender = req.body.gender || 'male';  // Default to male if not specified
    
    // Set up streaming response
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');
    
    // Call OpenAI service to process the image from memory buffer
    await openaiService.processRateSelfBuffer(req.file.buffer, req.file.mimetype, ratingType, gender, res);
    
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ message: 'An error occurred while processing your image' });
  }
});

// Compare Friends endpoint
router.post('/compare-friends', upload.fields([
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
    const gender = req.body.gender || 'male';  // Default to male if not specified
    
    // Prepare image buffers and mimetypes
    const imageBuffers = Object.values(req.files).map(fileArr => ({
      buffer: fileArr[0].buffer,
      mimetype: fileArr[0].mimetype
    }));
    
    // Set up streaming response
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');
    
    // Call OpenAI service to process the images from memory buffers
    await openaiService.processCompareFriendsBuffers(imageBuffers, ratingType, gender, res);
    
  } catch (error) {
    console.error('Error processing images:', error);
    res.status(500).json({ message: 'An error occurred while processing your images' });
  }
});

// Share content endpoint
router.post('/share', async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }
    
    // Generate unique ID
    const shareId = uuidv4();
    const key = `share:${shareId}`;
    
    // Store in Redis with 24 hour expiration
    await redis.setex(key, 86400, content); // 24 hours TTL
    
    // Return share ID
    res.json({ shareId });
  } catch (error) {
    console.error('Error creating share:', error);
    res.status(500).json({ message: 'Failed to create share link' });
  }
});

// Get shared content endpoint
router.get('/shared/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: 'Share ID is required' });
    }
    
    const key = `share:${id}`;
    
    // Get content from Redis
    const content = await redis.get(key);
    
    if (!content) {
      return res.status(404).json({ message: 'Shared content not found or expired' });
    }
    
    // Return content
    res.json({ content });
  } catch (error) {
    console.error('Error fetching shared content:', error);
    res.status(500).json({ message: 'Failed to load shared content' });
  }
});

module.exports = router;