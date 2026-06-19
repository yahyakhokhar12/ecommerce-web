import Review from '../models/Review.js';
import Product from '../models/Product.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiFeatures } from '../utils/apiFeatures.js';
import { logger } from '../utils/logger.js';

/**
 * Get all reviews with filtering and pagination
 */
export const getAllReviews = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(
    Review.find()
      .populate('product', 'title')
      .populate('user', 'name email'),
    req.query
  )
    .filter()
    .sort()
    .paginate();

  const reviews = await features.query;
  const totalReviews = await Review.countDocuments();

  res.status(200).json(
    new ApiResponse(
      200,
      {
        reviews,
        totalReviews,
        page: req.query.page || 1,
        limit: req.query.limit || 10,
      },
      'Reviews retrieved successfully'
    )
  );
});

/**
 * Get review by ID
 */
export const getReviewById = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)
    .populate('product')
    .populate('user', 'name email');

  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  res.status(200).json(new ApiResponse(200, review, 'Review retrieved successfully'));
});

/**
 * Approve review
 */
export const approveReview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const review = await Review.findById(id);

  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  review.isApproved = true;
  review.rejectionReason = null;

  await review.save();

  // Recalculate product rating
  const product = await Product.findById(review.product);
  if (product) {
    const approvedReviews = await Review.find({
      product: review.product,
      isApproved: true,
    });

    if (approvedReviews.length > 0) {
      const avgRating = 
        approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length;
      product.rating = Math.round(avgRating * 10) / 10;
      await product.save();
    }
  }

  logger.info(`Review ${id} approved by admin ${req.user._id}`);

  res.status(200).json(new ApiResponse(200, review, 'Review approved successfully'));
});

/**
 * Reject review
 */
export const rejectReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const review = await Review.findById(id);

  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  review.isApproved = false;
  review.rejectionReason = reason;

  await review.save();

  logger.info(`Review ${id} rejected by admin ${req.user._id}. Reason: ${reason}`);

  res.status(200).json(new ApiResponse(200, review, 'Review rejected successfully'));
});

/**
 * Delete review
 */
export const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const review = await Review.findById(id);

  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  await Review.findByIdAndDelete(id);

  // Recalculate product rating
  const product = await Product.findById(review.product);
  if (product) {
    const approvedReviews = await Review.find({
      product: review.product,
      isApproved: true,
    });

    if (approvedReviews.length > 0) {
      const avgRating = 
        approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length;
      product.rating = Math.round(avgRating * 10) / 10;
    } else {
      product.rating = 0;
    }
    await product.save();
  }

  logger.info(`Review ${id} deleted by admin ${req.user._id}`);

  res.status(200).json(new ApiResponse(200, {}, 'Review deleted successfully'));
});

/**
 * Hide/Unhide review
 */
export const toggleReviewVisibility = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const review = await Review.findById(id);

  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  review.isHidden = !review.isHidden;

  await review.save();

  logger.info(`Review ${id} visibility toggled by admin ${req.user._id}`);

  res.status(200).json(new ApiResponse(200, review, 'Review visibility updated successfully'));
});

/**
 * Get pending reviews
 */
export const getPendingReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ isApproved: false })
    .populate('product', 'title')
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(50);

  res.status(200).json(
    new ApiResponse(200, reviews, 'Pending reviews retrieved successfully')
  );
});

/**
 * Get review statistics
 */
export const getReviewStats = asyncHandler(async (req, res) => {
  const stats = await Review.aggregate([
    {
      $facet: {
        totalReviews: [{ $count: 'count' }],
        approvedReviews: [
          { $match: { isApproved: true } },
          { $count: 'count' },
        ],
        pendingReviews: [
          { $match: { isApproved: false } },
          { $count: 'count' },
        ],
        averageRating: [{ $group: { _id: null, avg: { $avg: '$rating' } } }],
        ratingDistribution: [
          {
            $group: {
              _id: '$rating',
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: -1 } },
        ],
      },
    },
  ]);

  const [result] = stats;

  res.status(200).json(
    new ApiResponse(
      200,
      {
        totalReviews: result.totalReviews[0]?.count || 0,
        approvedReviews: result.approvedReviews[0]?.count || 0,
        pendingReviews: result.pendingReviews[0]?.count || 0,
        averageRating: result.averageRating[0]?.avg || 0,
        ratingDistribution: result.ratingDistribution,
      },
      'Review statistics retrieved successfully'
    )
  );
});
