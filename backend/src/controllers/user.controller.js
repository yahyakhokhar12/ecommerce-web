import User from '../models/User.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../middlewares/upload.middleware.js';
import { ApiError } from '../utils/apiError.js';

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  sendSuccess(res, 200, user);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, address } = req.body;
  const updateData = { name, phone, address };
  if (req.file) {
    const user = await User.findById(req.user._id);
    if (user.avatar?.public_id) await deleteFromCloudinary(user.avatar.public_id);
    updateData.avatar = await uploadToCloudinary(req.file, 'ecommerce/avatars');
  }
  const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true, runValidators: true });
  sendSuccess(res, 200, user, 'Profile updated');
});

export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword))) throw new ApiError(400, 'Wrong password');
  user.password = newPassword;
  await user.save();
  sendSuccess(res, 200, null, 'Password updated');
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort('-createdAt');
  sendSuccess(res, 200, users);
});
