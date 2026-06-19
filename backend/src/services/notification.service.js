import Notification from '../models/Notification.js';
import { logger } from '../utils/logger.js';

/**
 * Create a notification for a user
 */
export const createNotification = async (
  recipientId,
  type,
  title,
  message,
  relatedEntity = null,
  priority = 'medium',
  actionUrl = null
) => {
  try {
    const notification = new Notification({
      recipient: recipientId,
      type,
      title,
      message,
      relatedEntity,
      priority,
      actionUrl,
    });

    await notification.save();
    logger.info(`Notification created for user ${recipientId}: ${type}`);

    return notification;
  } catch (error) {
    logger.error(`Error creating notification: ${error.message}`);
    throw error;
  }
};

/**
 * Notify admin about new order
 */
export const notifyNewOrder = async (order) => {
  try {
    // Get all admins
    const adminUsers = require('../models/user.js').default;
    const admins = await adminUsers.find({ role: 'admin' });

    const title = `New Order #${order.orderNumber}`;
    const message = `Customer ${order.user?.name} placed a new order for $${order.pricing?.total}`;

    for (const admin of admins) {
      await createNotification(
        admin._id,
        'order_created',
        title,
        message,
        { entityType: 'order', entityId: order._id },
        'high',
        `/admin/orders/${order._id}`
      );
    }
  } catch (error) {
    logger.error(`Error notifying about new order: ${error.message}`);
  }
};

/**
 * Notify about low stock
 */
export const notifyLowStock = async (product) => {
  try {
    const adminUsers = require('../models/user.js').default;
    const admins = await adminUsers.find({ role: 'admin' });

    const title = `Low Stock Alert: ${product.title}`;
    const message = `Product stock is low (${product.stock} units remaining)`;

    for (const admin of admins) {
      await createNotification(
        admin._id,
        'low_stock',
        title,
        message,
        { entityType: 'product', entityId: product._id },
        'medium',
        `/admin/inventory`
      );
    }
  } catch (error) {
    logger.error(`Error notifying about low stock: ${error.message}`);
  }
};

/**
 * Notify about payment failure
 */
export const notifyPaymentFailed = async (payment) => {
  try {
    const adminUsers = require('../models/user.js').default;
    const admins = await adminUsers.find({ role: 'admin' });

    const title = 'Payment Failed';
    const message = `Payment of $${payment.amount} failed for order. Reason: ${payment.failureReason}`;

    for (const admin of admins) {
      await createNotification(
        admin._id,
        'payment_failed',
        title,
        message,
        { entityType: 'payment', entityId: payment._id },
        'high',
        `/admin/payments`
      );
    }

    // Also notify customer
    await createNotification(
      payment.user,
      'payment_failed',
      'Payment Failed',
      'Your payment could not be processed. Please try again.',
      { entityType: 'payment', entityId: payment._id },
      'high'
    );
  } catch (error) {
    logger.error(`Error notifying about payment failure: ${error.message}`);
  }
};

/**
 * Notify customer about order status
 */
export const notifyOrderStatus = async (order, newStatus) => {
  try {
    const notificationMap = {
      confirmed: {
        type: 'order_confirmed',
        title: 'Order Confirmed',
        message: 'Your order has been confirmed and will be shipped soon.',
      },
      shipped: {
        type: 'order_shipped',
        title: 'Order Shipped',
        message: `Your order has been shipped. Tracking number: ${order.trackingNumber}`,
      },
      delivered: {
        type: 'order_delivered',
        title: 'Order Delivered',
        message: 'Your order has been delivered. Thank you for your purchase!',
      },
      cancelled: {
        type: 'order_cancelled',
        title: 'Order Cancelled',
        message: 'Your order has been cancelled.',
      },
    };

    const notif = notificationMap[newStatus];
    if (notif) {
      await createNotification(
        order.user,
        notif.type,
        notif.title,
        notif.message,
        { entityType: 'order', entityId: order._id },
        'medium',
        `/orders/${order._id}`
      );
    }
  } catch (error) {
    logger.error(`Error notifying order status: ${error.message}`);
  }
};

/**
 * Notify about new user registration
 */
export const notifyNewUser = async (user) => {
  try {
    const adminUsers = require('../models/user.js').default;
    const admins = await adminUsers.find({ role: 'admin' });

    const title = `New User Registration`;
    const message = `${user.name} (${user.email}) has registered`;

    for (const admin of admins) {
      await createNotification(
        admin._id,
        'account_update',
        title,
        message,
        { entityType: 'user', entityId: user._id },
        'low',
        `/admin/users`
      );
    }
  } catch (error) {
    logger.error(`Error notifying new user: ${error.message}`);
  }
};

/**
 * Get unread notification count for user
 */
export const getUnreadCount = async (userId) => {
  try {
    const count = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });
    return count;
  } catch (error) {
    logger.error(`Error getting unread count: ${error.message}`);
    return 0;
  }
};
