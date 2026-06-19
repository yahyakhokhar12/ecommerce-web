import User from '../models/user.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiFeatures } from '../utils/apiFeatures.js';
import { logger } from '../utils/logger.js';

/**
 * Get all users with filtering, sorting, and pagination
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(User.find().select('-password -refreshToken'), req.query)
    .filter()
    .sort()
    .paginate();

  const users = await features.query;
  const totalUsers = await User.countDocuments();

  res.status(200).json(
    new ApiResponse(
      200,
      {
        users,
        totalUsers,
        page: req.query.page || 1,
        limit: req.query.limit || 10,
      },
      'Users retrieved successfully'
    )
  );
});

/**
 * Get user by ID
 */
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password -refreshToken');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json(new ApiResponse(200, user, 'User retrieved successfully'));
});

/**
 * Update user details (Admin)
 */
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, role, isActive, phone, address } = req.body;

  const user = await User.findById(id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Check if email is already taken
  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(400, 'Email already in use');
    }
  }

  // Update user fields
  if (name) user.name = name;
  if (email) user.email = email;
  if (role) user.role = role;
  if (typeof isActive === 'boolean') user.isActive = isActive;
  if (phone) user.phone = phone;
  if (address) user.address = address;

  const updatedUser = await user.save();

  res.status(200).json(
    new ApiResponse(200, updatedUser.toObject({ getters: true, virtuals: false, versionKey: false, transform: (doc) => delete doc.password }), 'User updated successfully')
  );
});

/**
 * Delete user
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Prevent deleting the only admin
  if (id === req.user._id.toString()) {
    throw new ApiError(400, 'You cannot delete your own account');
  }

  const user = await User.findByIdAndDelete(id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  logger.info(`User ${user.email} deleted by admin ${req.user._id}`);

  res.status(200).json(new ApiResponse(200, {}, 'User deleted successfully'));
});

/**
 * Suspend/Deactivate user
 */
export const suspendUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const user = await User.findById(id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.role === 'admin') {
    throw new ApiError(400, 'Cannot suspend admin users');
  }

  user.isActive = false;
  user.suspensionReason = reason;
  user.suspendedAt = new Date();

  await user.save();

  logger.info(`User ${user.email} suspended by admin ${req.user._id}. Reason: ${reason}`);

  res.status(200).json(new ApiResponse(200, user, 'User suspended successfully'));
});

/**
 * Activate user
 */
export const activateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.isActive = true;
  user.suspensionReason = null;
  user.suspendedAt = null;

  await user.save();

  logger.info(`User ${user.email} activated by admin ${req.user._id}`);

  res.status(200).json(new ApiResponse(200, user, 'User activated successfully'));
});

/**
 * Change user role
 */
export const changeUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['customer', 'admin', 'manager'].includes(role)) {
    throw new ApiError(400, 'Invalid role');
  }

  const user = await User.findByIdAndUpdate(
    id,
    { role },
    { new: true }
  ).select('-password -refreshToken');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  logger.info(`User ${user.email} role changed to ${role} by admin ${req.user._id}`);

  res.status(200).json(new ApiResponse(200, user, 'User role updated successfully'));
});

/**
 * Search users
 */
export const searchUsers = asyncHandler(async (req, res) => {
  const { query } = req.query;

  if (!query || query.trim().length === 0) {
    throw new ApiError(400, 'Search query is required');
  }

  const users = await User.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } },
      { phone: { $regex: query, $options: 'i' } },
    ],
  })
    .select('-password -refreshToken')
    .limit(20);

  res.status(200).json(
    new ApiResponse(200, users, 'Users searched successfully')
  );
});

/**
 * Get user statistics
 */
export const getUserStats = asyncHandler(async (req, res) => {
  const stats = await User.aggregate([
    {
      $facet: {
        totalUsers: [{ $count: 'count' }],
        activeUsers: [
          { $match: { isActive: true } },
          { $count: 'count' },
        ],
        inactiveUsers: [
          { $match: { isActive: false } },
          { $count: 'count' },
        ],
        adminUsers: [
          { $match: { role: 'admin' } },
          { $count: 'count' },
        ],
        managerUsers: [
          { $match: { role: 'manager' } },
          { $count: 'count' },
        ],
        customerUsers: [
          { $match: { role: 'customer' } },
          { $count: 'count' },
        ],
        newUsersThisMonth: [
          {
            $match: {
              createdAt: {
                $gte: new Date(new Date().setDate(1)),
              },
            },
          },
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
        totalUsers: result.totalUsers[0]?.count || 0,
        activeUsers: result.activeUsers[0]?.count || 0,
        inactiveUsers: result.inactiveUsers[0]?.count || 0,
        adminUsers: result.adminUsers[0]?.count || 0,
        managerUsers: result.managerUsers[0]?.count || 0,
        customerUsers: result.customerUsers[0]?.count || 0,
        newUsersThisMonth: result.newUsersThisMonth[0]?.count || 0,
      },
      'User statistics retrieved successfully'
    )
  );
});
