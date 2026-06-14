import { stripe } from '../config/stripe.js';
import Order from '../models/Order.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { config } from '../config/index.js';
import { ApiError } from '../utils/apiError.js';

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
      } catch {}
    }
  }

  res.json({ received: true });
});
