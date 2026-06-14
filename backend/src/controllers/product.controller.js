import Product from '../models/Product.js';
import { ApiError } from '../utils/apiError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiFeatures } from '../utils/apiFeatures.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../middlewares/upload.middleware.js';

export const getProducts = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(Product.find({ isActive: true }), req.query)
    .filter()
    .search(['title', 'description', 'brand', 'tags'])
    .sort()
    .limitFields()
    .paginate();

  const [products, total] = await Promise.all([
    features.query.populate('category', 'name slug'),
    Product.countDocuments({ isActive: true }),
  ]);

  const page = features.pagination.page;
  const limit = features.pagination.limit;
  sendSuccess(res, 200, {
    products,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
    },
  });
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category', 'name slug');
  if (!product) throw new ApiError(404, 'Product not found');
  sendSuccess(res, 200, product);
});

export const createProduct = asyncHandler(async (req, res) => {
  let images = [];
  if (req.files && req.files.length) {
    images = await Promise.all(req.files.map((f) => uploadToCloudinary(f, 'ecommerce/products')));
  }
  const product = await Product.create({ ...req.body, images });
  sendSuccess(res, 201, product, 'Product created');
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');

  if (req.files && req.files.length) {
    await Promise.all(product.images.map((i) => i.public_id && deleteFromCloudinary(i.public_id)));
    const newImages = await Promise.all(req.files.map((f) => uploadToCloudinary(f, 'ecommerce/products')));
    req.body.images = newImages;
  }

  const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  sendSuccess(res, 200, updated, 'Product updated');
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');
  await Promise.all(product.images.map((i) => i.public_id && deleteFromCloudinary(i.public_id)));
  await product.deleteOne();
  sendSuccess(res, 200, null, 'Product deleted');
});
