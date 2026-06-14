import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

export const getDashboardStats = async () => {
  const [totalOrders, totalProducts, totalCustomers, revenueResult] = await Promise.all([
    Order.countDocuments(),
    Product.countDocuments(),
    User.countDocuments({ role: 'customer' }),
    Order.aggregate([
      { $match: { paymentInfo: { status: 'paid' } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
  ]);

  const totalRevenue = revenueResult[0]?.total || 0;
  const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
  const processingOrders = await Order.countDocuments({ orderStatus: 'processing' });

  return {
    totalRevenue,
    totalOrders,
    totalProducts,
    totalCustomers,
    pendingOrders,
    processingOrders,
  };
};

export const getSalesOverview = async (days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return await Order.aggregate([
    { $match: { createdAt: { $gte: startDate }, paymentInfo: { status: 'paid' } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        sales: { $sum: '$totalPrice' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { date: '$_id', sales: 1, orders: 1, _id: 0 } },
  ]);
};

export const getTopProducts = async (limit = 5) => {
  return await Order.aggregate([
    { $match: { paymentInfo: { status: 'paid' } } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        title: { $first: '$items.title' },
        totalSold: { $sum: '$items.quantity' },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: limit },
  ]);
};

export const getTopCustomers = async (limit = 5) => {
  return await Order.aggregate([
    { $match: { paymentInfo: { status: 'paid' } } },
    {
      $group: {
        _id: '$user',
        totalSpent: { $sum: '$totalPrice' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { totalSpent: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $project: {
        name: '$user.name',
        email: '$user.email',
        totalSpent: 1,
        orders: 1,
      },
    },
  ]);
};

export const getCategoryDistribution = async () => {
  return await Product.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
      },
    },
    {
      $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' },
    },
    { $unwind: '$category' },
    { $project: { name: '$category.name', count: 1, _id: 0 } },
  ]);
};
