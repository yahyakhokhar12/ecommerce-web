import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, Minus, Plus, ShieldCheck, ShoppingCart, Truck, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGetProductQuery } from '../api/apiSlice.js';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../features/cart/cartSlice.js';
import { addToWishlist, removeFromWishlist } from '../features/wishlist/wishlistSlice.js';
import { Button } from '../components/ui/button.jsx';
import { Rating } from '../components/common/Rating.jsx';
import { Skeleton } from '../components/ui/skeleton.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { formatPrice } from '../lib/utils.js';
import { PRODUCT_PLACEHOLDER, resolveImageUrl } from '../lib/productImage.js';
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
  const images = product?.images?.length
    ? product.images.map((image) => ({
        ...image,
        url: resolveImageUrl(typeof image === 'string' ? image : image.url),
      }))
    : [{ url: PRODUCT_PLACEHOLDER }];
  const isOutOfStock = !product?.stock || product.stock <= 0;

  if (isLoading) {
    return (
      <div className="container grid gap-8 py-10 md:grid-cols-2">
        <Skeleton className="aspect-[4/5] rounded-3xl bg-white/10" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4 bg-white/10" />
          <Skeleton className="h-5 w-1/2 bg-white/10" />
          <Skeleton className="h-40 w-full bg-white/10" />
        </div>
      </div>
    );
  }

  if (!product) return <p className="container py-20 text-center text-slate-400">Product not found</p>;

  return (
    <div className="container py-10">
      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <motion.div
            key={activeImg}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/30"
          >
            <img
              src={images[activeImg]?.url}
              alt={product.title}
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.src = PRODUCT_PLACEHOLDER;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
            {product.discount > 0 && (
              <Badge className="absolute left-5 top-5 border-white/10 bg-fuchsia-500/90 text-white">-{product.discount}%</Badge>
            )}
          </motion.div>
          <div className="mt-4 grid grid-cols-5 gap-3">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`aspect-square overflow-hidden rounded-2xl border transition ${activeImg === i ? 'border-teal-300 ring-2 ring-teal-300/30' : 'border-white/10 opacity-70 hover:opacity-100'}`}
                aria-label={`View product image ${i + 1}`}
              >
                <img
                  src={img.url}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.src = PRODUCT_PLACEHOLDER;
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="self-start rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-black/20 lg:sticky lg:top-28">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-300">{product.brand}</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-white lg:text-5xl">{product.title}</h1>
          <div className="mt-4 flex items-center gap-3">
            <Rating value={product.rating} count={product.numReviews} size="md" />
            <span className="text-sm text-slate-500">{product.sold || 0} sold</span>
          </div>
          <div className="mt-7 flex flex-wrap items-baseline gap-3">
            <span className="text-5xl font-black text-teal-200">{formatPrice(product.finalPrice)}</span>
            {product.discount > 0 && (
              <span className="text-xl text-slate-500 line-through">{formatPrice(product.price)}</span>
            )}
          </div>
          <p className="mt-6 leading-8 text-slate-300">{product.description}</p>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {[
              { icon: ShieldCheck, label: 'Secure checkout' },
              { icon: Truck, label: 'Fast delivery' },
              { icon: RotateCcw, label: 'Easy returns' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                <Icon className="h-5 w-5 text-fuchsia-300" />
                <p className="mt-2 text-xs font-medium text-slate-300">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-slate-300">Quantity</span>
            <div className="flex items-center rounded-full border border-white/10 bg-white/[0.06]">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3 text-slate-300 hover:text-white"><Minus className="h-4 w-4" /></button>
              <span className="px-5 font-semibold text-white">{qty}</span>
              <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="p-3 text-slate-300 hover:text-white disabled:opacity-40" disabled={isOutOfStock || qty >= product.stock}><Plus className="h-4 w-4" /></button>
            </div>
            <span className="text-sm text-slate-500">{product.stock} in stock</span>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="flex-1 bg-white text-slate-950 shadow-xl shadow-black/20 hover:bg-slate-100"
              onClick={() => {
                if (isOutOfStock) {
                  toast.error('This product is out of stock');
                  return;
                }
                dispatch(addToCart({ product, quantity: qty }));
                toast.success('Added to cart');
              }}
              disabled={isOutOfStock}
            >
              <ShoppingCart className="h-4 w-4" /> {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white/10 bg-white/[0.04] text-white hover:bg-white/10"
              onClick={() => {
                if (isWish) dispatch(removeFromWishlist(product._id));
                else dispatch(addToWishlist(product._id));
              }}
            >
              <Heart className={`h-4 w-4 ${isWish ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>

          {product.features?.length > 0 && (
            <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <h3 className="font-semibold text-white">Features</h3>
              <ul className="mt-3 grid gap-2 text-sm text-slate-400">
                {product.features.map((f, i) => <li key={i}>- {f}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
