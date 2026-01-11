import express from 'express';
import Order from '../models/Order.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Verify Khalti payment token and mark order as paid
// Expects { token, amount, orderId }
router.post('/khalti/verify', async (req, res) => {
  try {
    const { token, amount, orderId } = req.body;
    if (!token || !amount || !orderId) return res.status(400).json({ message: 'token, amount and orderId are required' });

    const secretKey = process.env.KHALTI_SECRET_KEY;
    if (!secretKey) return res.status(500).json({ message: 'KHALTI_SECRET_KEY not configured on server' });

    // Khalti expects amount in paisa (100 paisa = 1 NPR). Ensure client sends correct unit.
    const verifyUrl = 'https://khalti.com/api/v2/payment/verify/';

    const resp = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Key ${secretKey}`
      },
      body: JSON.stringify({ token, amount })
    });

    const data = await resp.json();
    if (!resp.ok) {
      return res.status(400).json({ message: 'Khalti verification failed', details: data });
    }

    // Verify signature/amount/order details as needed
    // Mark order as paid
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.paymentStatus = 'paid';
    order.paymentMethod = 'khalti';
    await order.save();

    return res.json({ success: true, khalti: data, order });
  } catch (err) {
    console.error('Khalti verify error', err);
    return res.status(500).json({ message: err.message });
  }
});

export default router;
