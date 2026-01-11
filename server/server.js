import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';


// Import routes
import productRoutes from './routes/products.js';
import userRoutes from './routes/users.js';
import orderRoutes from './routes/orders.js';
import bannerRoutes from './routes/banners.js';
import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/upload.js';
import settingsRoutes from './routes/settings.js';
import paymentsRoutes from './routes/payments.js';


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dwarika';
    
    // Ensure database name is in the connection string
    let connectionString = mongoURI;
    if (connectionString.includes('mongodb+srv://')) {
      // For Atlas, add database name if missing
      // Check if .mongodb.net is followed by /? or just ends
      if (connectionString.includes('.mongodb.net/?')) {
        // Replace .net/? with .net/dwarika?
        connectionString = connectionString.replace('.mongodb.net/?', '.mongodb.net/dwarika?');
      } else if (connectionString.endsWith('.mongodb.net')) {
        // Add /dwarika at the end
        connectionString = connectionString + '/dwarika';
      } else if (!connectionString.match(/\.mongodb\.net\/[^\/\?]+/)) {
        // No database name found, add it before query params
        connectionString = connectionString.replace(/(\.mongodb\.net)(\?|$)/, '$1/dwarika$2');
      }
    } else if (connectionString.includes('mongodb://') && !connectionString.match(/\/[^\/\?]+(\?|$)/)) {
      // Add database name for local connection
      connectionString = connectionString.replace(/\/$/, '/dwarika');
    }
    
    console.log('Connecting to MongoDB...');
    console.log('Connection string:', connectionString.replace(/:[^:@]+@/, ':****@')); // Hide password
    
    await mongoose.connect(connectionString, {
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
    });
    
    console.log('✓ MongoDB connected successfully');
    console.log(`  Database: ${mongoose.connection.name}`);
  } catch (err) {
    console.error('✗ MongoDB connection error:', err.message);
    console.error('  Please check:');
    console.error('  1. MongoDB Atlas IP whitelist (0.0.0.0/0 for all IPs)');
    console.error('  2. Connection string in .env file');
    console.error('  3. Database user credentials');
    // Don't exit - let the server start but API calls will fail
  }
};

connectDB();

// Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/payments', paymentsRoutes);


// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Serve frontend static files if built (supports SPA refresh on non-root paths)
try {
  const clientDist = path.join(__dirname, '..', 'dist');
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get('*', (req, res, next) => {
      // don't handle API routes
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(clientDist, 'index.html'));
    });
    console.log('Serving frontend from', clientDist);
  }
} catch (e) {
  // ignore
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

