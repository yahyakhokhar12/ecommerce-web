import { Router } from 'express';
import * as coupon from '../controllers/coupon.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = Router();
router.post('/validate', protect, coupon.validateCoupon);
router.get('/', protect, authorize('admin'), coupon.getCoupons);
router.post('/', protect, authorize('admin'), coupon.createCoupon);
router.delete('/:id', protect, authorize('admin'), coupon.deleteCoupon);

export default router;
