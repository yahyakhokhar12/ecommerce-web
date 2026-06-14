import { Router } from 'express';
import * as admin from '../controllers/admin.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(protect, authorize('admin'));
router.get('/dashboard', admin.dashboard);
router.get('/analytics', admin.analytics);

export default router;
