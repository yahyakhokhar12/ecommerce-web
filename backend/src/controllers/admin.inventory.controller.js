import Order from '../models/Order.js';
import Product from '../models/Product.js';
import StockHistory from '../models/StockHistory.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiFeatures } from '../utils/apiFeatures.js';
import { logger } from '../utils/logger.js';

const LOW_STOCK_THRESHOLD = 10;

/**
 * Get all products with stock info
 */
export const getInventory = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(Product.find().select('+stock'), req.query)
    .filter()
    .sort()
    .paginate();

  const products = await features.query;
  const totalProducts = await Product.countDocuments();

  const inventory = products.map((product) => ({
    _id: product._id,
    title: product.title,
    sku: product.SKU,
    stock: product.stock,
    price: product.finalPrice || product.price,
    lowStock: product.stock < LOW_STOCK_THRESHOLD,
    outOfStock: product.stock === 0,
  }));

  res.status(200).json(
    new ApiResponse(
      200,
      {
        inventory,
        totalProducts,
        page: req.query.page || 1,
        limit: req.query.limit || 10,
      },
      'Inventory retrieved successfully'
    )
  );
});

/**
 * Get low stock products
 */
export const getLowStockProducts = asyncHandler(async (req, res) => {
  const lowStockProducts = await Product.find({
    stock: { $gt: 0, $lt: LOW_STOCK_THRESHOLD },
  })
    .select('title SKU stock price')
    .sort({ stock: 1 });

  res.status(200).json(
    new ApiResponse(
      200,
      lowStockProducts,
      'Low stock products retrieved successfully'
    )
  );
});

/**
 * Get out of stock products
 */
export const getOutOfStockProducts = asyncHandler(async (req, res) => {
  const outOfStockProducts = await Product.find({ stock: 0 })
    .select('title SKU price')
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(
      200,
      outOfStockProducts,
      'Out of stock products retrieved successfully'
    )
  );
});

/**
 * Update product stock (Admin)
 */
export const updateProductStock = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity, reason, notes } = req.body;

  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  const previousStock = product.stock;
  const newStock = previousStock + quantity;

  if (newStock < 0) {
    throw new ApiError(400, 'Cannot set stock below 0');
  }

  product.stock = newStock;
  await product.save();

  // Record stock history
  const stockHistory = new StockHistory({
    product: productId,
    previousStock,
    newStock,
    changeQuantity: quantity,
    reason: reason || 'manual_adjustment',
    performedBy: req.user._id,
    notes,
    lowStockAlert: newStock < LOW_STOCK_THRESHOLD && newStock > 0,
    outOfStockAlert: newStock === 0,
  });

  await stockHistory.save();

  logger.info(
    `Stock updated for product ${productId}: ${previousStock} → ${newStock} by admin ${req.user._id}`
  );

  res.status(200).json(
    new ApiResponse(
      200,
      { product, stockHistory },
      'Product stock updated successfully'
    )
  );
});

/**
 * Get stock history for a product
 */
export const getStockHistory = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  const features = new ApiFeatures(
    StockHistory.find({ product: productId })
      .populate('performedBy', 'name email')
      .populate('relatedOrder', 'orderNumber'),
    req.query
  )
    .sort()
    .paginate();

  const history = await features.query;
  const totalHistory = await StockHistory.countDocuments({ product: productId });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        product: { _id: product._id, title: product.title, currentStock: product.stock },
        history,
        totalHistory,
        page: req.query.page || 1,
        limit: req.query.limit || 20,
      },
      'Stock history retrieved successfully'
    )
  );
});

/**
 * Bulk update stock
 */
export const bulkUpdateStock = asyncHandler(async (req, res) => {
  const { updates } = req.body;

  if (!Array.isArray(updates) || updates.length === 0) {
    throw new ApiError(400, 'Updates array is required');
  }

  const results = [];
  const errors = [];

  for (const update of updates) {
    try {
      const { productId, quantity, reason, notes } = update;

      const product = await Product.findById(productId);
      if (!product) {
        errors.push({ productId, error: 'Product not found' });
        continue;
      }

      const previousStock = product.stock;
      const newStock = previousStock + quantity;

      if (newStock < 0) {
        errors.push({ productId, error: 'Cannot set stock below 0' });
        continue;
      }

      product.stock = newStock;
      await product.save();

      const stockHistory = new StockHistory({
        product: productId,
        previousStock,
        newStock,
        changeQuantity: quantity,
        reason: reason || 'manual_adjustment',
        performedBy: req.user._id,
        notes,
        lowStockAlert: newStock < LOW_STOCK_THRESHOLD && newStock > 0,
        outOfStockAlert: newStock === 0,
      });

      await stockHistory.save();

      results.push({ productId, success: true, newStock });
    } catch (error) {
      errors.push({ productId: update.productId, error: error.message });
    }
  }

  logger.info(
    `Bulk stock update: ${results.length} succeeded, ${errors.length} failed by admin ${req.user._id}`
  );

  res.status(200).json(
    new ApiResponse(
      200,
      { results, errors },
      'Bulk stock update completed'
    )
  );
});

/**
 * Get inventory statistics
 */
export const getInventoryStats = asyncHandler(async (req, res) => {
  const stats = await Product.aggregate([
    {
      $facet: {
        totalProducts: [{ $count: 'count' }],
        outOfStock: [
          { $match: { stock: 0 } },
          { $count: 'count' },
        ],
        lowStock: [
          { $match: { stock: { $gt: 0, $lt: LOW_STOCK_THRESHOLD } } },
          { $count: 'count' },
        ],
        totalStockValue: [
          {
            $group: {
              _id: null,
              value: {
                $sum: {
                  $multiply: ['$stock', '$finalPrice'],
                },
              },
            },
          },
        ],
        averageStockPerProduct: [
          { $group: { _id: null, avg: { $avg: '$stock' } } },
        ],
      },
    },
  ]);

  const [result] = stats;

  res.status(200).json(
    new ApiResponse(
      200,
      {
        totalProducts: result.totalProducts[0]?.count || 0,
        outOfStock: result.outOfStock[0]?.count || 0,
        lowStock: result.lowStock[0]?.count || 0,
        totalStockValue: result.totalStockValue[0]?.value || 0,
        averageStockPerProduct: result.averageStockPerProduct[0]?.avg || 0,
      },
      'Inventory statistics retrieved successfully'
    )
  );
});
