import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  getDashboardStats,
  getSalesOverview,
  getTopProducts,
  getTopCustomers,
  getCategoryDistribution,
} from '../services/analytics.service.js';

export const dashboard = asyncHandler(async (req, res) => {
  const stats = await getDashboardStats();
  sendSuccess(res, 200, stats);
});

export const analytics = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const [sales, topProducts, topCustomers, categories] = await Promise.all([
    getSalesOverview(days),
    getTopProducts(),
    getTopCustomers(),
    getCategoryDistribution(),
  ]);
  sendSuccess(res, 200, { sales, topProducts, topCustomers, categories });
});
