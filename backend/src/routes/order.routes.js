import { Router } from 'express';
import * as order from '../controllers/order.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createOrderSchema } from '../validations/order.validation.js';

const router = Router();
router.post('/', protect, validate(createOrderSchema), order.createOrder);
router.get('/my-orders', protect, order.getMyOrders);
router.get('/:id', protect, order.getOrder);
router.get('/', protect, authorize('admin'), order.getAllOrders);
router.put('/:id/status', protect, authorize('admin'), order.updateOrderStatus);

export default router;
