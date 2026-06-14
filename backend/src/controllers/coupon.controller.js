import Coupon from '../models/Coupon.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';

export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderAmount } = req.body;
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) throw new ApiError(404, 'Coupon not found');

  const validation = coupon.isValid(orderAmount, req.user._id);
  if (!validation.valid) throw new ApiError(400, validation.message);
  const discount = coupon.calculateDiscount(orderAmount);

  sendSuccess(res, 200, { code: coupon.code, discount, type: coupon.type, value: coupon.value });
});

export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort('-createdAt');
  sendSuccess(res, 200, coupons);
});

export const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  sendSuccess(res, 201, coupon);
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  sendSuccess(res, 200, null, 'Coupon deleted');
});
