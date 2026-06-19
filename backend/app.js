const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Debug: Check if env vars are loading
console.log('âœ… JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('âœ… JWT_SECRET value:', process.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('âœ… MONGODB_URI:', process.env.MONGODB_URI);

const app = express();

// Middleware
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/myshop';

mongoose.connect(mongoURI)
  .then(() => console.log('âœ… MongoDB Connected Successfully!'))
  .catch(err => console.error('âŒ MongoDB Connection Error:', err.message));

// Test route
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Backend is working!',
    timestamp: new Date().toISOString()
  });
});

// ========== ROUTES ==========

// Auth routes
try {
  app.use('/api/auth', require('./routes/auth'));
  console.log('âœ… Auth routes loaded');
} catch (err) {
  console.error('âŒ Error loading auth routes:', err.message);
}

// Products routes - FIXED: Make sure the path is correct
try {
  // Check if products.js exists, if not try products-updated.js
  const fs = require('fs');
  const productsPath = './routes/products.js';
  const productsUpdatedPath = './routes/products-updated.js';

  if (fs.existsSync(productsPath)) {
    app.use('/api/products', require(productsPath));
    console.log('âœ… Products routes loaded from products.js');
  } else if (fs.existsSync(productsUpdatedPath)) {
    app.use('/api/products', require(productsUpdatedPath));
    console.log('âœ… Products routes loaded from products-updated.js');
  } else {
    console.error('âŒ No products route file found!');
  }
} catch (err) {
  console.error('âŒ Error loading products routes:', err.message);
}

// Cart routes
try {
  app.use('/api/cart', require('./routes/cart'));
  console.log('âœ… Cart routes loaded');
} catch (err) {
  console.error('âŒ Error loading cart routes:', err.message);
}

// Orders routes
try {
  app.use('/api/orders', require('./routes/orders'));
  console.log('âœ… Orders routes loaded');
} catch (err) {
  console.error('âŒ Error loading orders routes:', err.message);
}

// Admin routes
try {
  app.use('/api/admin', require('./routes/admin'));
  console.log('âœ… Admin routes loaded');
} catch (err) {
  console.error('âŒ Error loading admin routes:', err.message);
}

// Wishlist routes
try {
  app.use('/api/wishlist', require('./routes/wishlist'));
  console.log('âœ… Wishlist routes loaded');
} catch (err) {
  console.error('âŒ Error loading wishlist routes:', err.message);
}

// 404 handler - This should be LAST
app.use((req, res) => {
  console.log('âŒ 404 - Route not found:', req.originalUrl);
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('âŒ Server Error:', err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

module.exports = app;
