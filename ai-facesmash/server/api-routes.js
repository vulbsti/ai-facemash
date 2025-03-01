/**
 * API Routes for AI-Facesmash application
 */
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const openaiService = require('./openai-service');

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

module.exports = router;