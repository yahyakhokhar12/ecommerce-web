import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['percentage', 'fixed'], required: true },
    value: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscount: Number,
    usageLimit: Number,
    usedCount: { type: Number, default: 0 },
    userLimit: { type: Number, default: 1 },
    usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

couponSchema.methods.isValid = function (orderAmount, userId) {
  const now = new Date();
  if (!this.isActive) return { valid: false, message: 'Coupon is inactive' };
  if (now < this.validFrom || now > this.validUntil) return { valid: false, message: 'Coupon expired' };
  if (this.usageLimit && this.usedCount >= this.usageLimit) return { valid: false, message: 'Coupon limit reached' };
  if (orderAmount < this.minOrderAmount) return { valid: false, message: 'Minimum order amount not met' };
  if (this.userLimit && this.usedBy.filter(id => id.toString() === userId.toString()).length >= this.userLimit) {
    return { valid: false, message: 'You have already used this coupon' };
  }
  return { valid: true };
};

couponSchema.methods.calculateDiscount = function (orderAmount) {
  let discount = this.type === 'percentage' ? (orderAmount * this.value) / 100 : this.value;
  if (this.maxDiscount) discount = Math.min(discount, this.maxDiscount);
  return +discount.toFixed(2);
};

export default mongoose.model('Coupon', couponSchema);
