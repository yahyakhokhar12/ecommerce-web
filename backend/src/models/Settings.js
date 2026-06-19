import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: [true, 'Setting key is required'],
      unique: true,
      index: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Setting value is required'],
    },
    description: String,
    category: {
      type: String,
      enum: [
        'site',
        'payment',
        'email',
        'shipping',
        'tax',
        'security',
        'storage',
      ],
      default: 'site',
    },
    dataType: {
      type: String,
      enum: ['string', 'number', 'boolean', 'array', 'object'],
      default: 'string',
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound index for efficient querying by category
settingsSchema.index({ category: 1 });

export default mongoose.model('Settings', settingsSchema);
