import { Router } from 'express';
import * as review from '../controllers/review.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router({ mergeParams: true });
router.get('/product/:productId', review.getProductReviews);
router.post('/product/:productId', protect, review.createReview);
router.delete('/product/:productId/:id', protect, review.deleteReview);

export default router;
