import { stripe } from '../config/stripe.js';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import { sendSuccess, ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { config } from '../config/index.js';
import { ApiError } from '../utils/apiError.js';
import { logger } from '../utils/logger.js';
import { ApiFeatures } from '../utils/apiFeatures.js';

export const createPaymentIntent = asyncHandler(async (req, res) => {
  const { amount, orderId } = req.body;
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: 'usd',
    metadata: { orderId: orderId?.toString() || '' },
    automatic_payment_methods: { enabled: true },
  });
  sendSuccess(res, 200, { clientSecret: paymentIntent.client_secret, id: paymentIntent.id });
});

export const stripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, config.stripe.webhookSecret);
  } catch (err) {
    throw new ApiError(400, `Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object;
    const order = await Order.findOneAndUpdate(
      { _id: pi.metadata.orderId },
      {
        'paymentInfo.status': 'paid',
        'paymentInfo.transactionId': pi.id,
        'paymentInfo.paidAt': new Date(),
        orderStatus: 'processing',
      },
      { new: true }
    );
    if (order) {
      try {
        const { sendOrderConfirmation } = await import('../services/email.service.js');
        await sendOrderConfirmation(order.user, order);
      } catch (error) {
        logger.warn(`Payment confirmation email failed for ${order._id}: ${error.message}`);
      }
    }
  }

  res.json({ received: true });
});

// Admin: Get all payments with filtering and pagination
export const getAllPayments = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(Payment.find().populate('user', 'name email').populate('order', 'orderNumber'), req.query)
    .filter()
    .sort()
    .paginate();

  const payments = await features.query;
  const totalPayments = await Payment.countDocuments();

  res.status(200).json(
    new ApiResponse(200, {
      payments,
      totalPayments,
      page: req.query.page || 1,
      limit: req.query.limit || 10,
    }, 'Payments retrieved successfully')
  );
});

// Admin: Get payment by ID
export const getPaymentById = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('order');

  if (!payment) {
    throw new ApiError(404, 'Payment not found');
  }

  res.status(200).json(new ApiResponse(200, payment, 'Payment retrieved successfully'));
});

// Admin: Get payment stats for dashboard
export const getPaymentStats = asyncHandler(async (req, res) => {
  const stats = await Payment.aggregate([
    {
      $facet: {
        totalRevenue: [
          { $match: { status: 'paid' } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ],
        totalPending: [
          { $match: { status: 'pending' } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ],
        totalFailed: [
          { $match: { status: 'failed' } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ],
        totalRefunded: [
          { $match: { status: 'refunded' } },
          { $group: { _id: null, total: { $sum: '$refundAmount' } } },
        ],
        paymentMethodBreakdown: [
          { $match: { status: 'paid' } },
          { $group: { _id: '$paymentMethod', count: { $sum: 1 }, amount: { $sum: '$amount' } } },
        ],
      },
    },
  ]);

  const [result] = stats;

  res.status(200).json(
    new ApiResponse(200, {
      totalRevenue: result.totalRevenue[0]?.total || 0,
      totalPending: result.totalPending[0]?.total || 0,
      totalFailed: result.totalFailed[0]?.total || 0,
      totalRefunded: result.totalRefunded[0]?.total || 0,
      paymentMethodBreakdown: result.paymentMethodBreakdown,
    }, 'Payment stats retrieved successfully')
  );
});

// Admin: Refund a payment
export const refundPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { refundAmount, refundReason } = req.body;

  const payment = await Payment.findById(id);

  if (!payment) {
    throw new ApiError(404, 'Payment not found');
  }

  if (payment.status === 'refunded') {
    throw new ApiError(400, 'Payment is already refunded');
  }

  if (payment.status !== 'paid') {
    throw new ApiError(400, 'Payment must be paid before refunding');
  }

  if (refundAmount > payment.amount) {
    throw new ApiError(400, 'Refund amount cannot exceed payment amount');
  }

  // Process refund with Stripe
  if (payment.paymentMethod === 'stripe' && payment.stripePaymentIntentId) {
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      amount: Math.round(refundAmount * 100),
    });

    if (refund.status !== 'succeeded') {
      throw new ApiError(400, 'Stripe refund failed');
    }
  }

  // Update payment record
  const isPartialRefund = refundAmount < payment.amount;
  payment.status = isPartialRefund ? 'partially_refunded' : 'refunded';
  payment.refundAmount = refundAmount;
  payment.refundReason = refundReason;
  payment.refundedAt = new Date();

  await payment.save();

  // Update order status if full refund
  if (!isPartialRefund) {
    await Order.findByIdAndUpdate(
      payment.order,
      { orderStatus: 'refunded' },
      { new: true }
    );
  }

  res.status(200).json(new ApiResponse(200, payment, 'Payment refunded successfully'));
});
