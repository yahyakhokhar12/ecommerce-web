import { Router } from 'express';
import * as product from '../controllers/product.controller.js';
import { protect, authorize, optionalAuth } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createProductSchema } from '../validations/product.validation.js';

const router = Router();
router.get('/', optionalAuth, product.getProducts);
router.get('/:id', product.getProduct);
router.post('/', protect, authorize('admin'), upload.array('images', 5), validate(createProductSchema), product.createProduct);
router.put('/:id', protect, authorize('admin'), upload.array('images', 5), product.updateProduct);
router.delete('/:id', protect, authorize('admin'), product.deleteProduct);

export default router;
