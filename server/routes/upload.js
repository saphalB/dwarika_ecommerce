import express from 'express';
import upload from '../middleware/upload.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Helper to wrap multer single upload and capture errors
const singleUploadHandler = (field) => (req, res, next) => {
  upload.single(field)(req, res, (err) => {
    if (err) {
      console.error('Multer upload error:', err && err.message ? err.message : err);
      // Multer errors are usually due to file type/size
      return res.status(400).json({ message: err.message || 'File upload error' });
    }
    next();
  });
};

// Upload single image
router.post('/image', authenticate, isAdmin, singleUploadHandler('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Return the file path
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      message: 'File uploaded successfully',
      url: fileUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Error in upload route:', error && error.message ? error.message : error);
    res.status(500).json({ message: error.message });
  }
});

// Allow regular authenticated users to upload their avatar (not admin-only)
router.post('/avatar', authenticate, singleUploadHandler('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ message: 'Avatar uploaded', url: fileUrl, filename: req.file.filename });
  } catch (error) {
    console.error('Error in avatar upload route:', error && error.message ? error.message : error);
    res.status(500).json({ message: error.message });
  }
});

// Upload multiple images
router.post('/images', authenticate, isAdmin, upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const files = req.files.map(file => ({
      url: `/uploads/${file.filename}`,
      filename: file.filename
    }));

    res.json({
      message: 'Files uploaded successfully',
      files: files
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

