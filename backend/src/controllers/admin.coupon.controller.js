import Coupon from '../models/Coupon.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiFeatures } from '../utils/apiFeatures.js';
import { logger } from '../utils/logger.js';

/**
 * Get all coupons with filtering and pagination
 */
export const getAllCoupons = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(Coupon.find(), req.query)
    .filter()
    .sort()
    .paginate();

  const coupons = await features.query;
  const totalCoupons = await Coupon.countDocuments();

  res.status(200).json(
    new ApiResponse(
      200,
      {
        coupons,
        totalCoupons,
        page: req.query.page || 1,
        limit: req.query.limit || 10,
      },
      'Coupons retrieved successfully'
    )
  );
});

/**
 * Get coupon by ID
 */
export const getCouponById = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    throw new ApiError(404, 'Coupon not found');
  }

  res.status(200).json(new ApiResponse(200, coupon, 'Coupon retrieved successfully'));
});

/**
 * Create coupon
 */
export const createCoupon = asyncHandler(async (req, res) => {
  const { code, type, value, minOrderAmount, maxDiscount, usageLimit, userLimit, validFrom, validUntil, isActive, description } = req.body;

  // Check if coupon code already exists
  const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (existingCoupon) {
    throw new ApiError(400, 'Coupon code already exists');
  }

  // Validate coupon type
  if (!['percentage', 'fixed'].includes(type)) {
    throw new ApiError(400, 'Invalid coupon type');
  }

  // Validate percentage value
  if (type === 'percentage' && (value < 0 || value > 100)) {
    throw new ApiError(400, 'Percentage value must be between 0 and 100');
  }

  const coupon = new Coupon({
    code: code.toUpperCase(),
    type,
    value,
    minOrderAmount: minOrderAmount || 0,
    maxDiscount: maxDiscount || null,
    usageLimit: usageLimit || null,
    userLimit: userLimit || 1,
    validFrom: validFrom || new Date(),
    validUntil: validUntil || null,
    isActive: isActive !== undefined ? isActive : true,
    description,
  });

  await coupon.save();

  logger.info(`Coupon ${code} created by admin ${req.user._id}`);

  res.status(201).json(new ApiResponse(201, coupon, 'Coupon created successfully'));
});

/**
 * Update coupon
 */
export const updateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { code, type, value, minOrderAmount, maxDiscount, usageLimit, userLimit, validFrom, validUntil, isActive, description } = req.body;

  const coupon = await Coupon.findById(id);

  if (!coupon) {
    throw new ApiError(404, 'Coupon not found');
  }

  // Check if new code already exists
  if (code && code !== coupon.code) {
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      throw new ApiError(400, 'Coupon code already exists');
    }
  }

  if (code) coupon.code = code.toUpperCase();
  if (type) coupon.type = type;
  if (value !== undefined) coupon.value = value;
  if (minOrderAmount !== undefined) coupon.minOrderAmount = minOrderAmount;
  if (maxDiscount !== undefined) coupon.maxDiscount = maxDiscount;
  if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
  if (userLimit !== undefined) coupon.userLimit = userLimit;
  if (validFrom) coupon.validFrom = validFrom;
  if (validUntil !== undefined) coupon.validUntil = validUntil;
  if (typeof isActive === 'boolean') coupon.isActive = isActive;
  if (description) coupon.description = description;

  const updatedCoupon = await coupon.save();

  logger.info(`Coupon ${id} updated by admin ${req.user._id}`);

  res.status(200).json(new ApiResponse(200, updatedCoupon, 'Coupon updated successfully'));
});

/**
 * Delete coupon
 */
export const deleteCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const coupon = await Coupon.findByIdAndDelete(id);

  if (!coupon) {
    throw new ApiError(404, 'Coupon not found');
  }

  logger.info(`Coupon ${id} deleted by admin ${req.user._id}`);

  res.status(200).json(new ApiResponse(200, {}, 'Coupon deleted successfully'));
});

/**
 * Get coupon statistics
 */
export const getCouponStats = asyncHandler(async (req, res) => {
  const stats = await Coupon.aggregate([
    {
      $facet: {
        totalCoupons: [{ $count: 'count' }],
        activeCoupons: [
          { $match: { isActive: true } },
          { $count: 'count' },
        ],
        inactiveCoupons: [
          { $match: { isActive: false } },
          { $count: 'count' },
        ],
        mostUsedCoupons: [
          { $sort: { usedCount: -1 } },
          { $limit: 5 },
          {
            $project: {
              code: 1,
              type: 1,
              value: 1,
              usedCount: 1,
            },
          },
        ],
      },
    },
  ]);

  const [result] = stats;

  res.status(200).json(
    new ApiResponse(
      200,
      {
        totalCoupons: result.totalCoupons[0]?.count || 0,
        activeCoupons: result.activeCoupons[0]?.count || 0,
        inactiveCoupons: result.inactiveCoupons[0]?.count || 0,
        mostUsedCoupons: result.mostUsedCoupons,
      },
      'Coupon statistics retrieved successfully'
    )
  );
});
