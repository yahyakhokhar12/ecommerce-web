import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiFeatures } from '../utils/apiFeatures.js';
import { logger } from '../utils/logger.js';

/**
 * Get all categories with pagination
 */
export const getAllCategories = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(Category.find(), req.query)
    .filter()
    .sort()
    .paginate();

  const categories = await features.query;
  const totalCategories = await Category.countDocuments();

  res.status(200).json(
    new ApiResponse(
      200,
      {
        categories,
        totalCategories,
        page: req.query.page || 1,
        limit: req.query.limit || 10,
      },
      'Categories retrieved successfully'
    )
  );
});

/**
 * Get category by ID
 */
export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id).populate('products');

  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  res.status(200).json(new ApiResponse(200, category, 'Category retrieved successfully'));
});

/**
 * Create category
 */
export const createCategory = asyncHandler(async (req, res) => {
  const { name, slug, description, image, parent, isActive } = req.body;

  // Check if category already exists
  const existingCategory = await Category.findOne({ slug });
  if (existingCategory) {
    throw new ApiError(400, 'Category with this slug already exists');
  }

  const category = new Category({
    name,
    slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
    description,
    image,
    parent: parent || null,
    isActive: isActive !== undefined ? isActive : true,
  });

  await category.save();

  logger.info(`Category ${name} created by admin ${req.user._id}`);

  res.status(201).json(new ApiResponse(201, category, 'Category created successfully'));
});

/**
 * Update category
 */
export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, slug, description, image, parent, isActive } = req.body;

  const category = await Category.findById(id);

  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  // Check slug uniqueness
  if (slug && slug !== category.slug) {
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      throw new ApiError(400, 'Category with this slug already exists');
    }
  }

  if (name) category.name = name;
  if (slug) category.slug = slug;
  if (description) category.description = description;
  if (image) category.image = image;
  if (parent !== undefined) category.parent = parent || null;
  if (typeof isActive === 'boolean') category.isActive = isActive;

  const updatedCategory = await category.save();

  logger.info(`Category ${id} updated by admin ${req.user._id}`);

  res.status(200).json(new ApiResponse(200, updatedCategory, 'Category updated successfully'));
});

/**
 * Delete category
 */
export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id);

  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  // Check if category has products
  const productsCount = await Product.countDocuments({ category: id });
  if (productsCount > 0) {
    throw new ApiError(400, `Cannot delete category with ${productsCount} products. Remove products first.`);
  }

  await Category.findByIdAndDelete(id);

  logger.info(`Category ${id} deleted by admin ${req.user._id}`);

  res.status(200).json(new ApiResponse(200, {}, 'Category deleted successfully'));
});

/**
 * Get category statistics
 */
export const getCategoryStats = asyncHandler(async (req, res) => {
  const stats = await Category.aggregate([
    {
      $facet: {
        totalCategories: [{ $count: 'count' }],
        activeCategories: [
          { $match: { isActive: true } },
          { $count: 'count' },
        ],
        inactiveCategories: [
          { $match: { isActive: false } },
          { $count: 'count' },
        ],
      },
    },
  ]);

  const [result] = stats;

  res.status(200).json(
    new ApiResponse(
      200,
      {
        totalCategories: result.totalCategories[0]?.count || 0,
        activeCategories: result.activeCategories[0]?.count || 0,
        inactiveCategories: result.inactiveCategories[0]?.count || 0,
      },
      'Category statistics retrieved successfully'
    )
  );
});
