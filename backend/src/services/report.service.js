import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/user.js';
import Payment from '../models/Payment.js';
import { logger } from '../utils/logger.js';

/**
 * Generate sales report
 */
export const generateSalesReport = async (startDate, endDate) => {
  try {
    const orders = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
          orderStatus: { $ne: 'cancelled' },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.total' },
          averageOrderValue: { $avg: '$pricing.total' },
          totalItems: { $sum: { $size: '$items' } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return orders;
  } catch (error) {
    logger.error(`Error generating sales report: ${error.message}`);
    throw error;
  }
};

/**
 * Generate product performance report
 */
export const generateProductReport = async (startDate, endDate) => {
  try {
    const products = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalPrice' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 50 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
    ]);

    return products.map((p) => ({
      product: p.productInfo[0]?.title || 'Unknown',
      sku: p.productInfo[0]?.SKU,
      unitsSold: p.totalSold,
      revenue: p.totalRevenue,
      orders: p.orderCount,
    }));
  } catch (error) {
    logger.error(`Error generating product report: ${error.message}`);
    throw error;
  }
};

/**
 * Generate customer report
 */
export const generateCustomerReport = async (startDate, endDate) => {
  try {
    const customers = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      },
      {
        $group: {
          _id: '$user',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$pricing.total' },
          averageOrderValue: { $avg: '$pricing.total' },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 50 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
    ]);

    return customers.map((c) => ({
      customer: c.userInfo[0]?.name || 'Unknown',
      email: c.userInfo[0]?.email,
      totalOrders: c.totalOrders,
      totalSpent: c.totalSpent,
      averageOrderValue: c.averageOrderValue,
    }));
  } catch (error) {
    logger.error(`Error generating customer report: ${error.message}`);
    throw error;
  }
};

/**
 * Generate revenue report
 */
export const generateRevenueReport = async (startDate, endDate) => {
  try {
    const revenue = await Payment.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
          status: 'paid',
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalRevenue: { $sum: '$amount' },
          transactionCount: { $sum: 1 },
          averageTransaction: { $avg: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return revenue;
  } catch (error) {
    logger.error(`Error generating revenue report: ${error.message}`);
    throw error;
  }
};

/**
 * Generate inventory report
 */
export const generateInventoryReport = async () => {
  try {
    const inventory = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          outOfStock: {
            $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] },
          },
          lowStock: {
            $sum: { $cond: [{ $and: [{ $gt: ['$stock', 0] }, { $lt: ['$stock', 10] }] }, 1, 0] },
          },
          totalInventoryValue: {
            $sum: { $multiply: ['$stock', '$finalPrice'] },
          },
          averageStockPerProduct: { $avg: '$stock' },
        },
      },
    ]);

    return inventory[0] || {};
  } catch (error) {
    logger.error(`Error generating inventory report: ${error.message}`);
    throw error;
  }
};

/**
 * Convert data to CSV format
 */
export const convertToCSV = (data, headers) => {
  if (!Array.isArray(data) || data.length === 0) {
    return '';
  }

  const headerString = headers.join(',');
  const rows = data.map((row) =>
    headers.map((header) => {
      const value = row[header];
      // Escape quotes and wrap in quotes if contains comma
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value || '';
    }).join(',')
  );

  return [headerString, ...rows].join('\n');
};

/**
 * Generate CSV file
 */
export const generateCSVFile = (reportType, data, startDate, endDate) => {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${reportType}-report-${timestamp}.csv`;

  let headers = [];
  let csv = '';

  switch (reportType) {
    case 'sales':
      headers = ['Date', 'Total Orders', 'Total Revenue', 'Avg Order Value', 'Total Items'];
      csv = convertToCSV(
        data.map((row) => ({
          Date: row._id,
          'Total Orders': row.totalOrders,
          'Total Revenue': row.totalRevenue,
          'Avg Order Value': row.averageOrderValue.toFixed(2),
          'Total Items': row.totalItems,
        })),
        headers
      );
      break;

    case 'products':
      headers = ['Product', 'SKU', 'Units Sold', 'Revenue', 'Orders'];
      csv = convertToCSV(data, headers);
      break;

    case 'customers':
      headers = ['Customer', 'Email', 'Total Orders', 'Total Spent', 'Avg Order Value'];
      csv = convertToCSV(data, headers);
      break;

    case 'revenue':
      headers = ['Date', 'Total Revenue', 'Transactions', 'Avg Transaction'];
      csv = convertToCSV(
        data.map((row) => ({
          Date: row._id,
          'Total Revenue': row.totalRevenue,
          Transactions: row.transactionCount,
          'Avg Transaction': row.averageTransaction.toFixed(2),
        })),
        headers
      );
      break;

    default:
      csv = JSON.stringify(data, null, 2);
  }

  return { filename, csv };
};
