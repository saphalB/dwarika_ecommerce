import express from 'express';
import Banner from '../models/Banner.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all banners (public - filtered by active)
router.get('/', async (req, res) => {
  try {
    const { position, active } = req.query;
    const query = {};

    if (position) query.position = position;
    if (active !== undefined) {
      query.active = active === 'true';
    } else {
      // Default to active banners for public access
      query.active = true;
      const now = new Date();
      // Ensure banners are within optional start/end date window
      query.$and = [
        { $or: [ { startDate: { $exists: false } }, { startDate: { $lte: now } } ] },
        { $or: [ { endDate: { $exists: false } }, { endDate: { $gte: now } } ] }
      ];
    }

    const banners = await Banner.find(query)
      .sort({ order: 1, createdAt: -1 });
    
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single banner (public)
router.get('/:id', async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    res.json(banner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create banner (admin only)
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const banner = new Banner(req.body);
    await banner.save();
    res.status(201).json(banner);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update banner (admin only)
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    res.json(banner);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete banner (admin only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    res.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

