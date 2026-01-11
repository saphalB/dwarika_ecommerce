import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all orders (admin only)
router.get('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, paymentStatus, orderStatus } = req.query;
    const query = {};

    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (orderStatus) query.orderStatus = orderStatus;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('items.product', 'name image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Order.countDocuments(query);

    // Normalize shipping country for display: override missing or legacy 'India' to 'Nepal'
    orders.forEach(o => {
      if (o.shippingAddress) {
        if (!o.shippingAddress.country || o.shippingAddress.country === 'India') {
          o.shippingAddress.country = 'Nepal';
        }
      }
    });

    res.json({
      orders,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get orders for current authenticated user
router.get('/my', authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name image')
      .sort({ createdAt: -1 });

    // Normalize shipping country for display
    orders.forEach(o => {
      if (o.shippingAddress) {
        if (!o.shippingAddress.country || o.shippingAddress.country === 'India') {
          o.shippingAddress.country = 'Nepal';
        }
      }
    });

    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single order for current authenticated user
router.get('/my/:id', authenticate, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
      .populate('items.product');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Normalize shipping country for display
    if (order.shippingAddress) {
      if (!order.shippingAddress.country || order.shippingAddress.country === 'India') {
        order.shippingAddress.country = 'Nepal';
      }
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single order (admin only)
router.get('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone address')
      .populate('items.product');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create order (authenticated users only)
router.post('/', authenticate, async (req, res) => {
  try {
    // Prevent client from setting the user field; use authenticated user
    const orderData = { ...req.body, user: req.user._id };

    const order = new Order(orderData);
    await order.save();

    // Populate before sending response
    await order.populate('user', 'name email');
    await order.populate('items.product', 'name image');

    // Normalize shipping country for display
    if (order.shippingAddress) {
      if (!order.shippingAddress.country || order.shippingAddress.country === 'India') {
        order.shippingAddress.country = 'Nepal';
      }
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update order (admin only)
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Apply requested updates
    Object.keys(req.body || {}).forEach((k) => {
      order[k] = req.body[k];
    });

    // Business rule: when order is marked delivered and payment method is cash_on_delivery,
    // mark paymentStatus as 'paid'
    const newStatus = (req.body.orderStatus || order.orderStatus || '').toString();
    if (newStatus === 'delivered' && order.paymentMethod === 'cash_on_delivery') {
      order.paymentStatus = 'paid';
    }

    await order.save();
    await order.populate('user', 'name email phone');
    await order.populate('items.product', 'name image');

    // Normalize shipping country for display
    if (order.shippingAddress) {
      if (!order.shippingAddress.country || order.shippingAddress.country === 'India') {
        order.shippingAddress.country = 'Nepal';
      }
    }

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update own order (user) - allowed only while orderStatus is 'pending'
router.put('/my/:id', authenticate, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.orderStatus !== 'pending') {
      return res.status(400).json({ message: 'Order cannot be edited after it leaves pending status' });
    }

    // Only allow updates to shippingAddress and items from client
    const allowed = {};
    if (req.body.shippingAddress) allowed.shippingAddress = req.body.shippingAddress;
    if (req.body.items) allowed.items = req.body.items;

    Object.keys(allowed).forEach(k => { order[k] = allowed[k]; });

    // Recalculate totals if items provided
    if (allowed.items) {
      // items: [{ product, quantity, price }]
      order.subtotal = order.items.reduce((s, it) => s + ((it.price || 0) * (it.quantity || 0)), 0);
      order.total = order.subtotal + (order.shipping || 0);
    }

    await order.save();
    await order.populate('items.product', 'name image');
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete own order (user) - allowed only while orderStatus is 'pending'
router.delete('/my/:id', authenticate, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.orderStatus !== 'pending') {
      return res.status(400).json({ message: 'Order cannot be deleted after it leaves pending status' });
    }

    await Order.findByIdAndDelete(order._id);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete order (admin only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get order statistics (admin only)
router.get('/stats/summary', authenticate, isAdmin, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
    const completedOrders = await Order.countDocuments({ orderStatus: 'delivered' });
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    const revenue = totalRevenue[0]?.total || 0;

    res.json({
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue: revenue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get order status breakdown (admin only)
router.get('/stats/breakdown', authenticate, isAdmin, async (req, res) => {
  try {
    const agg = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
    ]);

    const breakdown = {};
    agg.forEach((r) => {
      breakdown[r._id || 'unknown'] = r.count;
    });

    // Ensure all expected statuses exist with zero defaults
    const expected = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    expected.forEach((s) => {
      if (!Object.prototype.hasOwnProperty.call(breakdown, s)) breakdown[s] = 0;
    });

    res.json(breakdown);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

