import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, Minus, Plus, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGetProductQuery } from '../api/apiSlice.js';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../features/cart/cartSlice.js';
import { addToWishlist, removeFromWishlist } from '../features/wishlist/wishlistSlice.js';
import { Button } from '../components/ui/button.jsx';
import { Rating } from '../components/common/Rating.jsx';
import { Skeleton } from '../components/ui/skeleton.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { formatPrice, formatDate } from '../lib/utils.js';
import toast from 'react-hot-toast';

export const ProductDetails = () => {
  const { id } = useParams();
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const { data, isLoading } = useGetProductQuery(id);
  const product = data?.data;
  const dispatch = useDispatch();
  const wishlist = useSelector((s) => s.wishlist.items);
  const isWish = product && wishlist.includes(product._id);

  if (isLoading) {
    return (
      <div className="container py-8 grid md:grid-cols-2 gap-8">
        <Skeleton className="aspect-square rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }
  if (!product) return <p className="container py-20 text-center">Product not found</p>;

  return (
    <div className="container py-8">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div>
          <motion.div
            key={activeImg}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="aspect-square rounded-2xl overflow-hidden glass"
          >
            <img src={product.images[activeImg]?.url} alt={product.title} className="w-full h-full object-cover" />
          </motion.div>
          <div className="flex gap-2 mt-4">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${activeImg === i ? 'border-fuchsia-500' : 'border-transparent'}`}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground uppercase">{product.brand}</p>
            <h1 className="text-3xl lg:text-4xl font-bold mt-1">{product.title}</h1>
            <div className="flex items-center gap-3 mt-2">
              <Rating value={product.rating} count={product.numReviews} size="md" />
              <span className="text-sm text-muted-foreground">{product.sold} sold</span>
            </div>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold gradient-text">{formatPrice(product.finalPrice)}</span>
            {product.discount > 0 && (
              <>
                <span className="text-xl text-muted-foreground line-through">{formatPrice(product.price)}</span>
                <Badge variant="destructive">-{product.discount}%</Badge>
              </>
            )}
          </div>
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Quantity:</span>
            <div className="flex items-center glass rounded-lg">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2"><Minus className="h-4 w-4" /></button>
              <span className="px-4 font-medium">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="p-2"><Plus className="h-4 w-4" /></button>
            </div>
            <span className="text-sm text-muted-foreground">{product.stock} in stock</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="gradient"
              size="lg"
              className="flex-1"
              onClick={() => {
                dispatch(addToCart({ product, quantity: qty }));
                toast.success('Added to cart');
              }}
            >
              <ShoppingCart className="h-4 w-4" /> Add to Cart
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                if (isWish) dispatch(removeFromWishlist(product._id));
                else dispatch(addToWishlist(product._id));
              }}
            >
              <Heart className={`h-4 w-4 ${isWish ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>
          {product.features?.length > 0 && (
            <div className="glass p-4 rounded-xl">
              <h3 className="font-semibold mb-2">Features</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {product.features.map((f, i) => <li key={i}>• {f}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
