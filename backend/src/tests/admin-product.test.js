import request from 'supertest';
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Buffer } from 'node:buffer';

process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test-access-secret-change-me';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-change-me';
process.env.JWT_ACCESS_EXPIRE = process.env.JWT_ACCESS_EXPIRE || '15m';
process.env.JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '7d';
process.env.CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const { default: app } = await import('../app.js');
const { default: User } = await import('../models/User.js');
const { default: Category } = await import('../models/Category.js');

let mongoServer;

before(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

after(async () => {
  if (mongoose.connection.readyState) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  await mongoServer?.stop();
});

describe('Admin Product API', () => {
  it('creates a product with category and form data', async () => {
    await User.create({
      name: 'Admin',
      email: 'admin@test.com',
      password: 'Password123!',
      role: 'admin',
    });

    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@test.com', password: 'Password123!' });

    assert.equal(login.status, 200);
    const token = login.body.data.accessToken;

    const category = await Category.create({
      name: 'Shirts',
      slug: 'shirts',
      description: 'Casual and formal shirts.',
    });

    const res = await request(app)
      .post('/api/v1/admin/products')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Oxford Shirt')
      .field('brand', 'LuxeCart')
      .field('description', 'Premium cotton shirt for daily and formal wear.')
      .field('price', '49.99')
      .field('discount', '0')
      .field('stock', '25')
      .field('category', category._id.toString())
      .field('isFeatured', 'true');

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.title, 'Oxford Shirt');
    assert.equal(res.body.data.category, category._id.toString());
  });

  it('creates a product with an uploaded image', async () => {
    await User.deleteMany({});
    await Category.deleteMany({});

    await User.create({
      name: 'Admin',
      email: 'image-admin@test.com',
      password: 'Password123!',
      role: 'admin',
    });

    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'image-admin@test.com', password: 'Password123!' });

    const category = await Category.create({
      name: 'Pants',
      slug: 'pants',
      description: 'Jeans and trousers.',
    });

    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
      'base64'
    );

    const res = await request(app)
      .post('/api/v1/admin/products')
      .set('Authorization', `Bearer ${login.body.data.accessToken}`)
      .field('title', 'Slim Pants')
      .field('brand', 'LuxeCart')
      .field('description', 'Comfortable slim fit pants for daily wear.')
      .field('price', '39.99')
      .field('discount', '0')
      .field('stock', '10')
      .field('category', category._id.toString())
      .attach('images', png, { filename: 'pants.png', contentType: 'image/png' });

    assert.equal(res.status, 201);
    assert.equal(res.body.data.images.length, 1);
    assert.match(res.body.data.images[0].url, /^\/uploads\/products\//);
  });
});
