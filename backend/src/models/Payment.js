import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order is required'],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'INR'],
    },
    paymentMethod: {
      type: String,
      enum: ['stripe', 'paypal', 'cod', 'razorpay'],
      required: [true, 'Payment method is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
      default: 'pending',
      index: true,
    },
    transactionId: {
      type: String,
      sparse: true,
      index: true,
    },
    stripePaymentIntentId: {
      type: String,
      sparse: true,
      unique: true,
    },
    paypalTransactionId: {
      type: String,
      sparse: true,
    },
    razorpayPaymentId: {
      type: String,
      sparse: true,
    },
    razorpayOrderId: {
      type: String,
      sparse: true,
    },
    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    refundReason: String,
    refundedAt: Date,
    failureReason: String,
    metadata: {
      type: Object,
      default: {},
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Payment', paymentSchema);
