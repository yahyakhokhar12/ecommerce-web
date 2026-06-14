import { Router } from 'express';
import * as category from '../controllers/category.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = Router();
router.get('/', category.getCategories);
router.post('/', protect, authorize('admin'), upload.single('image'), category.createCategory);
router.put('/:id', protect, authorize('admin'), upload.single('image'), category.updateCategory);
router.delete('/:id', protect, authorize('admin'), category.deleteCategory);

export default router;
