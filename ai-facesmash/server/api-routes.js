/**
 * API Routes for AI-Facesmash application
 */
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const openaiService = require('./openai-service');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

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
    const imagePath = req.file.path;
    
    // Set up streaming response
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');
    
    // Call OpenAI service to process the image
    await openaiService.processRateSelf(imagePath, ratingType, gender, res);
    
    // Clean up the uploaded file
    fs.unlink(imagePath, (err) => {
      if (err) console.error('Error deleting file:', err);
    });
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
    const imagePaths = Object.values(req.files).map(fileArr => fileArr[0].path);
    
    // Set up streaming response
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');
    
    // Call OpenAI service to process the images
    await openaiService.processCompareFriends(imagePaths, ratingType, gender, res);
    
    // Clean up the uploaded files
    imagePaths.forEach(path => {
      fs.unlink(path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    });
  } catch (error) {
    console.error('Error processing images:', error);
    res.status(500).json({ message: 'An error occurred while processing your images' });
  }
});

module.exports = router;