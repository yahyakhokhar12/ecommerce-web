import Notification from '../models/Notification.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiFeatures } from '../utils/apiFeatures.js';

/**
 * Get notifications for current user
 */
export const getNotifications = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(
    Notification.find({ recipient: req.user._id }),
    req.query
  )
    .filter()
    .sort()
    .paginate();

  const notifications = await features.query;
  const totalNotifications = await Notification.countDocuments({ recipient: req.user._id });
  const unreadCount = await Notification.countDocuments({ 
    recipient: req.user._id, 
    isRead: false 
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        notifications,
        totalNotifications,
        unreadCount,
        page: req.query.page || 1,
        limit: req.query.limit || 20,
      },
      'Notifications retrieved successfully'
    )
  );
});

/**
 * Get notification by ID
 */
export const getNotificationById = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  if (notification.recipient.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You do not have permission to access this notification');
  }

  // Mark as read
  if (!notification.isRead) {
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();
  }

  res.status(200).json(new ApiResponse(200, notification, 'Notification retrieved successfully'));
});

/**
 * Mark notification as read
 */
export const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findById(id);

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  if (notification.recipient.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You do not have permission to access this notification');
  }

  notification.isRead = true;
  notification.readAt = new Date();
  await notification.save();

  res.status(200).json(new ApiResponse(200, notification, 'Notification marked as read'));
});

/**
 * Mark all notifications as read
 */
export const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  res.status(200).json(
    new ApiResponse(
      200,
      { modifiedCount: result.modifiedCount },
      'All notifications marked as read'
    )
  );
});

/**
 * Delete notification
 */
export const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findById(id);

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  if (notification.recipient.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You do not have permission to delete this notification');
  }

  await Notification.findByIdAndDelete(id);

  res.status(200).json(new ApiResponse(200, {}, 'Notification deleted successfully'));
});

/**
 * Delete all notifications for user
 */
export const deleteAllNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ recipient: req.user._id });

  res.status(200).json(new ApiResponse(200, {}, 'All notifications deleted successfully'));
});

/**
 * Get unread notifications count
 */
export const getUnreadCount = asyncHandler(async (req, res) => {
  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false,
  });

  res.status(200).json(
    new ApiResponse(200, { unreadCount }, 'Unread count retrieved successfully')
  );
});

/**
 * Create notification (Admin/System use)
 */
export const createNotification = asyncHandler(async (req, res) => {
  const { recipient, type, title, message, relatedEntity, priority, actionUrl, metadata } = req.body;

  // Validate notification type
  const validTypes = [
    'order_created',
    'order_confirmed',
    'order_shipped',
    'order_delivered',
    'order_cancelled',
    'payment_success',
    'payment_failed',
    'low_stock',
    'out_of_stock',
    'review_posted',
    'review_approved',
    'product_available',
    'new_coupon',
    'account_update',
  ];

  if (!validTypes.includes(type)) {
    throw new ApiError(400, 'Invalid notification type');
  }

  const notification = new Notification({
    recipient,
    type,
    title,
    message,
    relatedEntity,
    priority: priority || 'medium',
    actionUrl,
    metadata: metadata || {},
  });

  await notification.save();

  res.status(201).json(new ApiResponse(201, notification, 'Notification created successfully'));
});

/**
 * Get notification statistics (Admin)
 */
export const getNotificationStats = asyncHandler(async (req, res) => {
  const stats = await Notification.aggregate([
    {
      $facet: {
        totalNotifications: [{ $count: 'count' }],
        unreadNotifications: [
          { $match: { isRead: false } },
          { $count: 'count' },
        ],
        byType: [
          { $group: { _id: '$type', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ],
        byPriority: [
          { $group: { _id: '$priority', count: { $sum: 1 } } },
        ],
      },
    },
  ]);

  const [result] = stats;

  res.status(200).json(
    new ApiResponse(
      200,
      {
        totalNotifications: result.totalNotifications[0]?.count || 0,
        unreadNotifications: result.unreadNotifications[0]?.count || 0,
        byType: result.byType,
        byPriority: result.byPriority,
      },
      'Notification statistics retrieved successfully'
    )
  );
});
