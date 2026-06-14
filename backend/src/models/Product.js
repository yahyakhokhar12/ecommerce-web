import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: String,
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxlength: 1000 },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      maxlength: 200,
      index: 'text',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: 5000,
    },
    shortDescription: { type: String, maxlength: 300 },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    brand: { type: String, required: true, index: true },
    sku: { type: String, unique: true, sparse: true, uppercase: true },
    images: [
      {
        public_id: String,
        url: { type: String, required: true },
      },
    ],
    price: { type: Number, required: true, min: 0 },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    finalPrice: { type: Number },
    stock: { type: Number, required: true, min: 0, default: 0 },
    sold: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    reviews: [reviewSchema],
    tags: [String],
    features: [String],
    specifications: {
      type: Map,
      of: String,
    },
    isFeatured: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
  },
  { timestamps: true }
);

productSchema.index({ title: 'text', description: 'text', brand: 'text', tags: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ price: 1, rating: -1 });
productSchema.index({ createdAt: -1, sold: -1 });

productSchema.pre('save', function (next) {
  if (this.discount > 0) {
    this.finalPrice = +(this.price * (1 - this.discount / 100)).toFixed(2);
  } else {
    this.finalPrice = this.price;
  }
  next();
});

productSchema.methods.calculateAverageRating = function () {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.numReviews = 0;
  } else {
    const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
    this.rating = +(total / this.reviews.length).toFixed(1);
    this.numReviews = this.reviews.length;
  }
};

export default mongoose.model('Product', productSchema);
