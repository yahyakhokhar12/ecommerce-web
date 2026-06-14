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
import toast from 'react-hot-toast';

export const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const wishlist = useSelector((s) => s.wishlist.items);
  const isWishlisted = wishlist.includes(product._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
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
      whileHover={{ y: -4 }}
      className="group relative"
    >
      <Link to={`/products/${product._id}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
          <img
            src={product.images?.[0]?.url || '/placeholder.png'}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          {product.discount > 0 && (
            <Badge variant="destructive" className="absolute top-3 left-3">-{product.discount}%</Badge>
          )}
          <button
            onClick={toggleWishlist}
            className="absolute top-3 right-3 p-2 rounded-full glass hover:scale-110 transition"
            aria-label="Wishlist"
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
          <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
            <Button onClick={handleAddToCart} variant="gradient" className="w-full" size="sm">
              <ShoppingCart className="h-4 w-4" /> Add to Cart
            </Button>
          </div>
        </div>
        <div className="mt-4 space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">{product.brand}</p>
          <h3 className="font-medium line-clamp-1">{product.title}</h3>
          <Rating value={product.rating} count={product.numReviews} />
          <div className="flex items-center gap-2 mt-1">
            <span className="font-bold text-lg">{formatPrice(product.finalPrice)}</span>
            {product.discount > 0 && (
              <span className="text-sm text-muted-foreground line-through">{formatPrice(product.price)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
