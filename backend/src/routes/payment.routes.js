import { Router } from 'express';
import * as payment from '../controllers/payment.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();
router.post('/create-intent', protect, payment.createPaymentIntent);
router.post('/webhook', payment.stripeWebhook);

export default router;
