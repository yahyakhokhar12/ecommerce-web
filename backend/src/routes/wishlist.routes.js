import { Router } from 'express';
import * as wishlist from '../controllers/wishlist.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();
router.get('/', protect, wishlist.getWishlist);
router.post('/add', protect, wishlist.addToWishlist);
router.delete('/remove/:productId', protect, wishlist.removeFromWishlist);

export default router;
