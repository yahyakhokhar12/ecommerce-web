import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../features/cart/cartSlice.js';
import { addToWishlist, removeFromWishlist } from '../../features/wishlist/wishlistSlice.js';
import { Badge } from '../ui/badge.jsx';
import { Button } from '../ui/button.jsx';
import { Rating } from './Rating.jsx';
import { formatPrice } from '../../lib/utils.js';
import { getProductImage, PRODUCT_PLACEHOLDER } from '../../lib/productImage.js';
import toast from 'react-hot-toast';

export const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const wishlist = useSelector((s) => s.wishlist.items);
  const isWishlisted = wishlist.includes(product._id);
  const isOutOfStock = !product.stock || product.stock <= 0;
  const imageUrl = getProductImage(product);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (isOutOfStock) {
      toast.error('This product is out of stock');
      return;
    }
    dispatch(addToCart({ product, quantity: 1 }));
    toast.success('Added to cart');
  };

  const toggleWishlist = (e) => {
    e.preventDefault();
    if (isWishlisted) dispatch(removeFromWishlist(product._id));
    else dispatch(addToWishlist(product._id));
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className="group relative"
    >
      <Link to={`/products/${product._id}`} className="block rounded-3xl border border-white/10 bg-white/[0.045] p-3 shadow-xl shadow-black/20 transition hover:border-white/20 hover:bg-white/[0.07]">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-slate-900">
          <img
            src={imageUrl}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.src = PRODUCT_PLACEHOLDER;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent opacity-80" />
          {product.discount > 0 && (
            <Badge className="absolute left-3 top-3 border-white/10 bg-fuchsia-500/90 text-white shadow-lg shadow-fuchsia-500/25">-{product.discount}%</Badge>
          )}
          {isOutOfStock && (
            <Badge className="absolute bottom-3 left-3 bg-slate-900 text-white">Out of stock</Badge>
          )}
          <button
            onClick={toggleWishlist}
            className="absolute right-3 top-3 rounded-full border border-white/10 bg-black/35 p-2 text-white backdrop-blur transition hover:scale-110 hover:bg-white/15"
            aria-label="Wishlist"
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
          <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
            <Button onClick={handleAddToCart} className="w-full bg-white text-slate-950 hover:bg-slate-100" size="sm" disabled={isOutOfStock}>
              <ShoppingCart className="h-4 w-4" /> {isOutOfStock ? 'Unavailable' : 'Add to Cart'}
            </Button>
          </div>
        </div>
        <div className="mt-4 space-y-2 px-1 pb-1">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{product.brand}</p>
          <h3 className="line-clamp-1 font-semibold text-white">{product.title}</h3>
          <Rating value={product.rating} count={product.numReviews} />
          <div className="flex items-center gap-2 mt-1">
            <span className="text-lg font-black text-teal-200">{formatPrice(product.finalPrice)}</span>
            {product.discount > 0 && (
              <span className="text-sm text-slate-500 line-through">{formatPrice(product.price)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
