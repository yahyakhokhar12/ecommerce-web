import mongoose from 'mongoose';

const stockHistorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required'],
      index: true,
    },
    previousStock: {
      type: Number,
      required: true,
      min: 0,
    },
    newStock: {
      type: Number,
      required: true,
      min: 0,
    },
    changeQuantity: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      enum: [
        'order_placed',
        'order_cancelled',
        'manual_adjustment',
        'stock_received',
        'return_processed',
        'damage',
        'inventory_sync',
      ],
      required: [true, 'Reason is required'],
    },
    relatedOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      sparse: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    notes: String,
    lowStockAlert: {
      type: Boolean,
      default: false,
    },
    outOfStockAlert: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
stockHistorySchema.index({ product: 1, createdAt: -1 });
stockHistorySchema.index({ reason: 1 });
stockHistorySchema.index({ createdAt: -1 });
stockHistorySchema.index({ product: 1, reason: 1 });

export default mongoose.model('StockHistory', stockHistorySchema);
