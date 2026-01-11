import express from 'express';
import Setting from '../models/Setting.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Default payment methods
const DEFAULT_PAYMENT_METHODS = [
  { id: 'cash_on_delivery', label: 'Cash on Delivery', enabled: true },
  { id: 'card', label: 'Card (Credit/Debit)', enabled: false },
  { id: 'khalti', label: 'Khalti (Mobile Pay)', enabled: true }
];

// Get payment methods (public) - frontend uses this to decide which methods to show
router.get('/payment-methods', async (req, res) => {
  try {
    const doc = await Setting.findOne({ key: 'paymentMethods' });
    if (!doc) return res.json({ paymentMethods: DEFAULT_PAYMENT_METHODS });
    return res.json({ paymentMethods: doc.value || DEFAULT_PAYMENT_METHODS });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update payment methods (admin only)
router.put('/payment-methods', authenticate, isAdmin, async (req, res) => {
  try {
    const { paymentMethods } = req.body;
    if (!Array.isArray(paymentMethods)) return res.status(400).json({ message: 'paymentMethods must be an array' });

    const updated = await Setting.findOneAndUpdate(
      { key: 'paymentMethods' },
      { key: 'paymentMethods', value: paymentMethods },
      { upsert: true, new: true }
    );

    res.json({ paymentMethods: updated.value });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get shipping charge (public) - admin can edit
router.get('/shipping-charge', async (req, res) => {
  try {
    const doc = await Setting.findOne({ key: 'shippingCharge' });
    const value = doc ? doc.value : { amount: 500 };
    return res.json({ shippingCharge: value });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update shipping charge (admin only)
router.put('/shipping-charge', authenticate, isAdmin, async (req, res) => {
  try {
    const { shippingCharge } = req.body;
    if (!shippingCharge || typeof shippingCharge.amount !== 'number') return res.status(400).json({ message: 'shippingCharge must be an object with numeric amount' });

    const updated = await Setting.findOneAndUpdate(
      { key: 'shippingCharge' },
      { key: 'shippingCharge', value: shippingCharge },
      { upsert: true, new: true }
    );

    res.json({ shippingCharge: updated.value });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
