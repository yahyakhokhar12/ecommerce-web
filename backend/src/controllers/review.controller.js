import Review from '../models/Review.js';
import Product from '../models/Product.js';
import { ApiError } from '../utils/apiError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createReview = asyncHandler(async (req, res) => {
  const { rating, comment, title } = req.body;
  const product = await Product.findById(req.params.productId);
  if (!product) throw new ApiError(404, 'Product not found');

  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );
  if (alreadyReviewed) throw new ApiError(400, 'You already reviewed this product');

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
    title,
  };
  product.reviews.push(review);
  product.calculateAverageRating();
  await product.save();

  await Review.create({ product: product._id, user: req.user._id, rating, comment, title });
  sendSuccess(res, 201, product, 'Review added');
});

export const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId, isApproved: true })
    .populate('user', 'name avatar')
    .sort('-createdAt');
  sendSuccess(res, 200, reviews);
});

export const deleteReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) throw new ApiError(404, 'Product not found');
  product.reviews = product.reviews.filter(
    (r) => r._id.toString() !== req.params.id && r.user.toString() !== req.user._id.toString()
  );
  product.calculateAverageRating();
  await product.save();
  await Review.findByIdAndDelete(req.params.id);
  sendSuccess(res, 200, null, 'Review deleted');
});
