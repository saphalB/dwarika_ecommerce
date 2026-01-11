import express from 'express';
import User from '../models/User.js';
import { authenticate, isAdmin } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, status } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single user (admin only)
router.get('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create user (admin only)
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { password, ...userData } = req.body;
    const hashedPassword = await bcrypt.hash(password || 'password123', 10);
    
    const user = new User({
      ...userData,
      password: hashedPassword
    });
    await user.save();
    
    const userResponse = user.toObject();
    delete userResponse.password;
    res.status(201).json(userResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

  // Update current user's profile (users cannot change their name here)
  router.put('/me', authenticate, async (req, res) => {
    try {
      const { phone, address, addresses, avatar, currentPassword, newPassword } = req.body;
      const update = {};
      if (phone) update.phone = phone;
      if (address) update.address = address; // legacy single address
      if (addresses) update.addresses = addresses; // preferred multi-address
      // allow explicit null to remove avatar
      if (Object.prototype.hasOwnProperty.call(req.body, 'avatar')) update.avatar = avatar;

      // Handle password change if requested
      if (currentPassword && newPassword) {
        const me = await User.findById(req.user._id).select('+password');
        if (!me) return res.status(404).json({ message: 'User not found' });
        const ok = await bcrypt.compare(currentPassword, me.password);
        if (!ok) return res.status(400).json({ message: 'Current password is incorrect' });
        update.password = await bcrypt.hash(newPassword, 10);
      }

      const user = await User.findByIdAndUpdate(req.user._id, update, { new: true }).select('-password');
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

// Update user (admin only)
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    const update = { ...updateData };

    if (password) {
      update.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

