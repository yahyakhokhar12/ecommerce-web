const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/myshop';

const products = [
  {
    title: 'Aura Wireless Headphones',
    description: 'Immersive sound, 40-hour battery, and plush ear cushions built for all-day comfort.',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1518441983-fb9b6f9b8d36?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Nebula Smart Watch',
    description: 'Track fitness, sleep, and notifications with a vivid AMOLED display.',
    price: 179.0,
    image: 'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Studio Desk Lamp',
    description: 'Minimal LED lamp with warm lighting modes and touch controls.',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Comet Travel Backpack',
    description: 'Water-resistant, 28L capacity, and a padded laptop sleeve for daily travel.',
    price: 84.5,
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Solar Portable Charger',
    description: 'Fast-charging 20,000mAh battery with dual USB-C outputs.',
    price: 59.0,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Luxe Ceramic Mug Set',
    description: 'Set of 4 matte ceramic mugs with a soft-touch finish.',
    price: 36.0,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Nimbus Yoga Mat',
    description: 'Non-slip, sweat-resistant mat with extra cushioning.',
    price: 42.0,
    image: 'https://images.unsplash.com/photo-1526401485004-2aa7f3f0f4f2?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Orbit Bluetooth Speaker',
    description: '360° sound, deep bass, and 12-hour playtime in a compact body.',
    price: 69.99,
    image: 'https://images.unsplash.com/photo-1512446816042-444d641267eb?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Terra Desk Organizer',
    description: 'Solid wood desk organizer with slots for phone, pens, and accessories.',
    price: 28.0,
    image: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'CloudSoft Throw Blanket',
    description: 'Ultra-soft, breathable knit blanket for cozy evenings.',
    price: 39.99,
    image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Pulse Wireless Charger',
    description: '15W fast wireless charger with magnetic alignment.',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Metro Stainless Bottle',
    description: 'Keeps drinks cold 24h / hot 12h with leak-proof seal.',
    price: 24.0,
    image: 'https://images.unsplash.com/photo-1526401281623-2f4a1f2b7f36?auto=format&fit=crop&w=800&q=80'
  }
];

const seed = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('âœ… Connected to MongoDB');

    await Product.deleteMany({});
    const inserted = await Product.insertMany(products);
    console.log(`âœ… Seeded ${inserted.length} products`);
  } catch (error) {
    console.error('âŒ Seeding failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

seed();
