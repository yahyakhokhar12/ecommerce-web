import { Router } from 'express';
import * as user from '../controllers/user.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = Router();
router.get('/profile', protect, user.getProfile);
router.put('/profile', protect, upload.single('avatar'), user.updateProfile);
router.put('/update-password', protect, user.updatePassword);
router.get('/', protect, authorize('admin'), user.getAllUsers);

export default router;
