import { Router } from 'express';
import * as admin from '../controllers/admin.controller.js';
import * as adminUsers from '../controllers/admin.user.controller.js';
import * as adminCategories from '../controllers/admin.category.controller.js';
import * as adminReviews from '../controllers/admin.review.controller.js';
import * as adminCoupons from '../controllers/admin.coupon.controller.js';
import * as adminPayments from '../controllers/payment.controller.js';
import * as adminNotifications from '../controllers/admin.notification.controller.js';
import * as adminInventory from '../controllers/admin.inventory.controller.js';
import * as adminSettings from '../controllers/admin.settings.controller.js';
import * as adminReports from '../controllers/admin.report.controller.js';
import * as product from '../controllers/product.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createProductSchema } from '../validations/product.validation.js';

const router = Router();
router.use(protect, authorize('admin'));

// Dashboard & Analytics
router.get('/dashboard', admin.dashboard);
router.get('/analytics', admin.analytics);

// User Management
router.get('/users', adminUsers.getAllUsers);
router.get('/users/:id', adminUsers.getUserById);
router.put('/users/:id', adminUsers.updateUser);
router.delete('/users/:id', adminUsers.deleteUser);
router.post('/users/:id/suspend', adminUsers.suspendUser);
router.post('/users/:id/activate', adminUsers.activateUser);
router.put('/users/:id/role', adminUsers.changeUserRole);
router.get('/users-search', adminUsers.searchUsers);
router.get('/users-stats', adminUsers.getUserStats);

// Category Management
router.get('/categories', adminCategories.getAllCategories);
router.post('/categories/seed-defaults', adminCategories.seedCategories);
router.get('/categories/:id', adminCategories.getCategoryById);
router.post('/categories', adminCategories.createCategory);
router.put('/categories/:id', adminCategories.updateCategory);
router.delete('/categories/:id', adminCategories.deleteCategory);
router.get('/categories-stats', adminCategories.getCategoryStats);

// Review Management
router.get('/reviews', adminReviews.getAllReviews);
router.get('/reviews/:id', adminReviews.getReviewById);
router.post('/reviews/:id/approve', adminReviews.approveReview);
router.post('/reviews/:id/reject', adminReviews.rejectReview);
router.delete('/reviews/:id', adminReviews.deleteReview);
router.post('/reviews/:id/toggle-visibility', adminReviews.toggleReviewVisibility);
router.get('/reviews-pending', adminReviews.getPendingReviews);
router.get('/reviews-stats', adminReviews.getReviewStats);

// Coupon Management
router.get('/coupons', adminCoupons.getAllCoupons);
router.get('/coupons/:id', adminCoupons.getCouponById);
router.post('/coupons', adminCoupons.createCoupon);
router.put('/coupons/:id', adminCoupons.updateCoupon);
router.delete('/coupons/:id', adminCoupons.deleteCoupon);
router.get('/coupons-stats', adminCoupons.getCouponStats);

// Payment Management
router.get('/payments', adminPayments.getAllPayments);
router.get('/payments/:id', adminPayments.getPaymentById);
router.post('/payments/:id/refund', adminPayments.refundPayment);
router.get('/payments-stats', adminPayments.getPaymentStats);
router.get('/payments-search', adminPayments.searchPayments);

// Notification Management
router.get('/notifications', adminNotifications.getNotifications);
router.get('/notifications/:id', adminNotifications.getNotificationById);
router.put('/notifications/:id/read', adminNotifications.markAsRead);
router.post('/notifications/mark-all-read', adminNotifications.markAllAsRead);
router.delete('/notifications/:id', adminNotifications.deleteNotification);
router.post('/notifications/delete-all', adminNotifications.deleteAllNotifications);
router.get('/notifications-unread-count', adminNotifications.getUnreadCount);
router.post('/notifications', adminNotifications.createNotification);
router.get('/notifications-stats', adminNotifications.getNotificationStats);

// Inventory Management
router.get('/inventory', adminInventory.getInventory);
router.get('/inventory-low-stock', adminInventory.getLowStockProducts);
router.get('/inventory-out-of-stock', adminInventory.getOutOfStockProducts);
router.put('/inventory/:productId/stock', adminInventory.updateProductStock);
router.get('/inventory/:productId/history', adminInventory.getStockHistory);
router.post('/inventory/bulk-update', adminInventory.bulkUpdateStock);
router.get('/inventory-stats', adminInventory.getInventoryStats);

// Settings Management
router.get('/settings', adminSettings.getAllSettings);
router.get('/settings/category/:category', adminSettings.getSettingsByCategory);
router.get('/settings/key/:key', adminSettings.getSettingByKey);
router.post('/settings', adminSettings.upsertSetting);
router.delete('/settings/:key', adminSettings.deleteSetting);
router.put('/settings-site', adminSettings.updateSiteSettings);
router.put('/settings-payment', adminSettings.updatePaymentSettings);
router.put('/settings-shipping', adminSettings.updateShippingSettings);
router.put('/settings-tax', adminSettings.updateTaxSettings);
router.get('/config', adminSettings.getSiteConfig);

// Reports & Export
router.get('/reports/sales', adminReports.getSalesReport);
router.get('/reports/products', adminReports.getProductReport);
router.get('/reports/customers', adminReports.getCustomerReport);
router.get('/reports/revenue', adminReports.getRevenueReport);
router.get('/reports/inventory', adminReports.getInventoryReport);
router.get('/reports/export', adminReports.exportReportAsCSV);

// Product Management
router.post('/products', upload.array('images', 5), validate(createProductSchema), product.createProduct);
router.put('/products/:id', upload.array('images', 5), product.updateProduct);
router.delete('/products/:id', product.deleteProduct);

export default router;
