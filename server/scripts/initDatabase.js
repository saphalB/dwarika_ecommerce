import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Banner from '../models/Banner.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const sampleProducts = [
  {
    name: "Gold Necklace Set",
    description: "Exquisite gold necklace set with intricate designs, perfect for special occasions.",
    price: 45000,
    originalPrice: 50000,
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop",
    category: "Necklace",
    rating: 5,
    reviewCount: 12,
    stock: 10,
    featured: true,
    status: "active",
    material: "Gold",
    weight: 25.5
  },
  {
    name: "Diamond Ring",
    description: "Beautiful diamond ring with premium quality stones, a symbol of elegance.",
    price: 85000,
    originalPrice: 95000,
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop",
    category: "Ring",
    rating: 5,
    reviewCount: 8,
    stock: 5,
    featured: true,
    status: "active",
    material: "Gold with Diamond",
    weight: 8.2
  },
  {
    name: "Gold Bangles",
    description: "Traditional gold bangles with modern design, comfortable to wear.",
    price: 35000,
    originalPrice: 40000,
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop",
    category: "Bangles",
    rating: 4,
    reviewCount: 15,
    stock: 20,
    featured: true,
    status: "active",
    material: "Gold",
    weight: 45.0
  },
  {
    name: "Pearl Earrings",
    description: "Elegant pearl earrings that add sophistication to any outfit.",
    price: 25000,
    originalPrice: 30000,
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop",
    category: "Earrings",
    rating: 5,
    reviewCount: 10,
    stock: 15,
    featured: false,
    status: "active",
    material: "Pearl with Gold",
    weight: 5.5
  },
  {
    name: "Gold Chain",
    description: "Premium quality gold chain, perfect for daily wear or special occasions.",
    price: 55000,
    originalPrice: 60000,
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop",
    category: "Chain",
    rating: 4,
    reviewCount: 7,
    stock: 8,
    featured: false,
    status: "active",
    material: "Gold",
    weight: 30.0
  },
  {
    name: "Bridal Set",
    description: "Complete bridal jewelry set including necklace, earrings, and bangles.",
    price: 125000,
    originalPrice: 150000,
    image: "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400&h=400&fit=crop",
    category: "Bridal Set",
    rating: 5,
    reviewCount: 5,
    stock: 3,
    featured: false,
    status: "active",
    material: "Gold with Precious Stones",
    weight: 120.0
  }
];

const sampleBanners = [
  {
    title: "Exquisite Jewelry Collection",
    subtitle: "Discover our premium collection of handcrafted jewelry",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&h=600&fit=crop",
    link: "/products",
    position: "hero",
    order: 1,
    active: true
  },
  {
    title: "Special Offer",
    subtitle: "Up to 20% off on selected items",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200&h=600&fit=crop",
    link: "/products",
    position: "featured",
    order: 1,
    active: true
  }
];

const initDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dwarika');
    console.log('✓ Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('\nClearing existing data...');
    await Product.deleteMany({});
    await Banner.deleteMany({});
    // Don't delete users and orders - keep them
    console.log('✓ Cleared products and banners');

    // Create Products
    console.log('\nCreating products...');
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`✓ Created ${createdProducts.length} products`);

    // Create Banners
    console.log('\nCreating banners...');
    const createdBanners = await Banner.insertMany(sampleBanners);
    console.log(`✓ Created ${createdBanners.length} banners`);

    // Check if admin user exists
    const adminExists = await User.findOne({ email: 'admin@dwarika.com' });
    if (!adminExists) {
      console.log('\nCreating admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = new User({
        name: 'Admin',
        email: 'admin@dwarika.com',
        password: hashedPassword,
        role: 'admin',
        status: 'active'
      });
      await admin.save();
      console.log('✓ Admin user created');
      console.log('  Email: admin@dwarika.com');
      console.log('  Password: admin123');
    } else {
      console.log('\n✓ Admin user already exists');
    }

    // Display summary
    console.log('\n=== Database Initialization Complete ===');
    console.log(`Products: ${await Product.countDocuments()}`);
    console.log(`Users: ${await User.countDocuments()}`);
    console.log(`Orders: ${await Order.countDocuments()}`);
    console.log(`Banners: ${await Banner.countDocuments()}`);

    console.log('\n✓ All collections have been created and initialized!');
    
    await mongoose.connection.close();
    console.log('\n✓ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

initDatabase();

