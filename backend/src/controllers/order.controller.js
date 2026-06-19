import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import { ApiError } from '../utils/apiError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiFeatures } from '../utils/apiFeatures.js';
import { sendOrderConfirmation, sendOrderShippedEmail, sendOrderDeliveredEmail } from '../services/email.service.js';
import { logger } from '../utils/logger.js';

const TAX_RATE = 0.08;
const FREE_SHIPPING_THRESHOLD = 100;
const SHIPPING_FEE = 10;

export const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, billingAddress, couponCode, paymentMethod } = req.body;

  let itemsPrice = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) throw new ApiError(404, `Product ${item.product} not found`);
    if (product.stock < item.quantity) throw new ApiError(400, `Insufficient stock for ${product.title}`);

    const price = product.finalPrice;
    itemsPrice += price * item.quantity;

    orderItems.push({
      product: product._id,
      title: product.title,
      image: product.images[0]?.url,
      price,
      quantity: item.quantity,
    });
  }

  let discountAmount = 0;
  let couponDoc = null;
  if (couponCode) {
    couponDoc = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (couponDoc) {
      const v = couponDoc.isValid(itemsPrice, req.user._id);
      if (v.valid) discountAmount = couponDoc.calculateDiscount(itemsPrice);
    }
  }

  const taxPrice = +((itemsPrice - discountAmount) * TAX_RATE).toFixed(2);
  const shippingPrice = itemsPrice - discountAmount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const totalPrice = +(itemsPrice - discountAmount + taxPrice + shippingPrice).toFixed(2);

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    billingAddress: billingAddress || shippingAddress,
    paymentInfo: { method: paymentMethod, status: paymentMethod === 'cod' ? 'pending' : 'pending' },
    itemsPrice,
    taxPrice,
    shippingPrice,
    discountAmount,
    coupon: couponDoc?._id,
    totalPrice,
  });

  if (couponDoc) {
    couponDoc.usedCount += 1;
    couponDoc.usedBy.push(req.user._id);
    await couponDoc.save();
  }

  // decrement stock
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity, sold: item.quantity } });
  }

  try {
    await sendOrderConfirmation(req.user, order);
  } catch (error) {
    logger.warn(`Order confirmation email failed for ${order._id}: ${error.message}`);
  }

  sendSuccess(res, 201, order, 'Order created');
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(Order.find({ user: req.user._id }), req.query)
    .sort()
    .paginate();
  const orders = await features.query;
  sendSuccess(res, 200, { orders });
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized');
  }
  sendSuccess(res, 200, order);
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(Order.find(), req.query).sort().paginate();
  const [orders, total] = await Promise.all([
    features.query.populate('user', 'name email'),
    Order.countDocuments(),
  ]);
  sendSuccess(res, 200, { orders, total });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, trackingNumber, carrier } = req.body;
  const order = await Order.findById(req.params.id).populate('user');
  if (!order) throw new ApiError(404, 'Order not found');

  order.orderStatus = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (carrier) order.carrier = carrier;
  if (status === 'delivered') {
    order.deliveredAt = new Date();
    order.paymentInfo.status = 'paid';
    try {
      await sendOrderDeliveredEmail(order.user, order);
    } catch (error) {
      logger.warn(`Order delivered email failed for ${order._id}: ${error.message}`);
    }
  }
  if (status === 'shipped') {
    try {
      await sendOrderShippedEmail(order.user, order);
    } catch (error) {
      logger.warn(`Order shipped email failed for ${order._id}: ${error.message}`);
    }
  }
  await order.save();
  sendSuccess(res, 200, order, 'Order updated');
});
