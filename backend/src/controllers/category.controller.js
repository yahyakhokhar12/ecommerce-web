import Category from '../models/Category.js';
import { ApiError } from '../utils/apiError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../middlewares/upload.middleware.js';

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true });
  sendSuccess(res, 200, categories);
});

export const createCategory = asyncHandler(async (req, res) => {
  let image = {};
  if (req.file) image = await uploadToCloudinary(req.file, 'ecommerce/categories');
  const category = await Category.create({ ...req.body, image });
  sendSuccess(res, 201, category);
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, 'Category not found');
  if (req.file) {
    if (category.image?.public_id) await deleteFromCloudinary(category.image.public_id);
    category.image = await uploadToCloudinary(req.file, 'ecommerce/categories');
  }
  Object.assign(category, req.body);
  await category.save();
  sendSuccess(res, 200, category);
});

export const deleteCategory = asyncHandler(async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  sendSuccess(res, 200, null, 'Category deleted');
});
