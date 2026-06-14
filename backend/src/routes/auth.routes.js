import { Router } from 'express';
import * as auth from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validations/auth.validation.js';

const router = Router();
router.post('/register', validate(registerSchema), auth.register);
router.post('/login', validate(loginSchema), auth.login);
router.post('/refresh-token', auth.refreshToken);
router.post('/forgot-password', validate(forgotPasswordSchema), auth.forgotPassword);
router.put('/reset-password/:token', validate(resetPasswordSchema), auth.resetPassword);
router.post('/logout', protect, auth.logout);
router.get('/me', protect, auth.getMe);

export default router;
