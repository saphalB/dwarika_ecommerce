import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Setting from '../models/Setting.js';

dotenv.config();

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dwarika';

const run = async () => {
  try {
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const paymentMethods = [
      { id: 'cash_on_delivery', label: 'Cash on Delivery', enabled: true },
      { id: 'card', label: 'Card (Credit/Debit)', enabled: true },
      { id: 'khalti', label: 'Khalti (Mobile Pay)', enabled: true }
    ];

    const updated = await Setting.findOneAndUpdate(
      { key: 'paymentMethods' },
      { key: 'paymentMethods', value: paymentMethods },
      { upsert: true, new: true }
    );

    console.log('Payment methods updated:', updated.value);
    process.exit(0);
  } catch (err) {
    console.error('Error updating payment methods:', err);
    process.exit(1);
  }
};

run();
