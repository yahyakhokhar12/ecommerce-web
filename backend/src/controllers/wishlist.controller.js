import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getWishlist = asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');
  if (!wishlist) wishlist = await Wishlist.create({ user: req.user._id, products: [] });
  sendSuccess(res, 200, wishlist);
});

export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const product = await Product.findById(productId);
  if (!product) throw new Error('Product not found');

  const wishlist = await Wishlist.findOneAndUpdate(
    { user: req.user._id },
    { $addToSet: { products: productId } },
    { new: true, upsert: true }
  ).populate('products');
  sendSuccess(res, 200, wishlist, 'Added to wishlist');
});

export const removeFromWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOneAndUpdate(
    { user: req.user._id },
    { $pull: { products: req.params.productId } },
    { new: true }
  ).populate('products');
  sendSuccess(res, 200, wishlist, 'Removed from wishlist');
});
