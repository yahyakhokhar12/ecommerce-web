import cron from 'node-cron';
import { logger } from '../utils/logger.js';
import Coupon from '../models/Coupon.js';
import Product from '../models/Product.js';

// Run daily at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    const result = await Coupon.updateMany(
      { validUntil: { $lt: new Date() }, isActive: true },
      { isActive: false }
    );
    logger.info(`Deactivated ${result.modifiedCount} expired coupons`);
  } catch (error) {
    logger.error(`Cron job failed: ${error.message}`);
  }
});
