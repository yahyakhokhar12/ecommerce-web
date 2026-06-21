import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email'],
    },
    password: {
      type: String,
      required: function () {
        return this.authProvider === 'local';
      },
      minlength: 8,
      select: false,
    },
    authProvider: {
      type: String,
      enum: ['local', 'google', 'facebook'],
      default: 'local',
      index: true,
    },
    socialIds: {
      google: String,
      facebook: String,
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },
    avatar: {
      public_id: String,
      url: {
        type: String,
        default: '',
      },
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    lastLogin: Date,
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.index({ createdAt: -1 });

userSchema.virtual('orders', {
  ref: 'Order',
  foreignField: 'user',
  localField: '_id',
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Fix OverwriteModelError
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
