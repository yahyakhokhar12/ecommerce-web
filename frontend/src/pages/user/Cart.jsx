import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { updateQuantity, removeFromCart, selectCartItems, selectCartTotal, clearCart } from '../../features/cart/cartSlice.js';
import { Button } from '../../components/ui/button.jsx';
import { formatPrice } from '../../lib/utils.js';

export const Cart = () => {
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (!items.length) {
    return (
      <div className="container py-20 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <p className="text-muted-foreground mt-2">Start adding products you love</p>
        <Button asChild variant="gradient" className="mt-6">
          <Link to="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.product}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="glass p-4 rounded-2xl flex gap-4"
              >
                <img src={item.image} alt={item.title} className="h-24 w-24 rounded-lg object-cover" />
                <div className="flex-1">
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-lg font-bold mt-1">{formatPrice(item.price)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => dispatch(updateQuantity({ productId: item.product, quantity: Math.max(1, item.quantity - 1) }))}
                      className="p-1 rounded glass"
                    ><Minus className="h-3 w-3" /></button>
                    <span className="px-3 font-medium">{item.quantity}</span>
                    <button
                      onClick={() => dispatch(updateQuantity({ productId: item.product, quantity: item.quantity + 1 }))}
                      className="p-1 rounded glass"
                    ><Plus className="h-3 w-3" /></button>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <p className="font-bold">{formatPrice(item.price * item.quantity)}</p>
                  <button
                    onClick={() => dispatch(removeFromCart(item.product))}
                    className="text-destructive hover:bg-destructive/10 p-2 rounded"
                  ><Trash2 className="h-4 w-4" /></button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <Button variant="ghost" onClick={() => dispatch(clearCart())}>Clear Cart</Button>
        </div>
        <div className="glass p-6 rounded-2xl h-fit space-y-4">
          <h3 className="font-bold text-xl">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(total)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{total > 100 ? 'Free' : '$10.00'}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>{formatPrice(total * 0.08)}</span></div>
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatPrice(total + (total > 100 ? 0 : 10) + total * 0.08)}</span>
            </div>
          </div>
          <Button variant="gradient" className="w-full" size="lg" onClick={() => navigate('/checkout')}>
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  );
};
