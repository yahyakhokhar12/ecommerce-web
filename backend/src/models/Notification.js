import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient is required'],
      index: true,
    },
    type: {
      type: String,
      enum: [
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
      ],
      required: [true, 'Notification type is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
    },
    relatedEntity: {
      entityType: {
        type: String,
        enum: ['order', 'product', 'payment', 'review', 'user'],
      },
      entityId: mongoose.Schema.Types.ObjectId,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: Date,
    actionUrl: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

// TTL index - auto-delete after 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

export default mongoose.model('Notification', notificationSchema);
