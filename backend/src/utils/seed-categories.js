import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { logger } from './logger.js';
import { seedDefaultCategories } from './defaultCategories.js';

const run = async () => {
  await connectDB();
  const summary = await seedDefaultCategories();
  logger.info(
    `Default categories ready: ${summary.inserted} inserted, ${summary.existing} already existed, ${summary.total} total`
  );
  await mongoose.connection.close();
};

run().catch(async (error) => {
  logger.error(`Category seed failed: ${error.message}`);
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
});
