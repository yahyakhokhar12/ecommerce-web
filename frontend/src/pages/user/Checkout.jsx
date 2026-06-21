import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { selectCartItems, selectCartTotal, clearCart } from '../../features/cart/cartSlice.js';
import { useCreateOrderMutation } from '../../api/ordersApi.js';
import { Input } from '../../components/ui/input.jsx';
import { Label } from '../../components/ui/label.jsx';
import { Button } from '../../components/ui/button.jsx';
import { formatPrice } from '../../lib/utils.js';

export const Checkout = () => {
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [address, setAddress] = useState({
    fullName: '', phone: '', street: '', city: '', state: '', zipCode: '', country: 'USA',
  });

  useEffect(() => {
    if (!items.length) navigate('/cart', { replace: true });
  }, [items.length, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const order = await createOrder({
        items: items.map((i) => ({ product: i.product, quantity: i.quantity })),
        shippingAddress: address,
        paymentMethod,
      }).unwrap();
      dispatch(clearCart());
      toast.success('Order placed!');
      navigate(`/order-success/${order.data._id}`);
    } catch (err) {
      toast.error(err?.data?.message || 'Order failed');
    }
  };

  if (!items.length) return null;

  return (
    <div className="container py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-lg">Shipping Address</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Full Name</Label><Input required value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} /></div>
              <div><Label>Phone</Label><Input required value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} /></div>
            </div>
            <div><Label>Street</Label><Input required value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} /></div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div><Label>City</Label><Input required value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} /></div>
              <div><Label>State</Label><Input required value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} /></div>
              <div><Label>Zip</Label><Input required value={address.zipCode} onChange={(e) => setAddress({ ...address, zipCode: e.target.value })} /></div>
            </div>
          </div>
          <div className="glass p-6 rounded-2xl">
            <h3 className="font-bold text-lg mb-4">Payment</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className={`cursor-pointer rounded-xl border p-4 transition ${paymentMethod === 'cod' ? 'border-fuchsia-500 bg-fuchsia-500/10' : 'hover:bg-accent'}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="sr-only"
                />
                <span className="font-medium">Cash on delivery</span>
                <span className="mt-1 block text-sm text-muted-foreground">Pay when your order arrives.</span>
              </label>
              <label className={`cursor-pointer rounded-xl border p-4 transition ${paymentMethod === 'stripe' ? 'border-fuchsia-500 bg-fuchsia-500/10' : 'hover:bg-accent'}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="stripe"
                  checked={paymentMethod === 'stripe'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="sr-only"
                />
                <span className="font-medium">Card</span>
                <span className="mt-1 block text-sm text-muted-foreground">Creates a pending card order for payment review.</span>
              </label>
            </div>
          </div>
        </div>
        <div className="glass p-6 rounded-2xl h-fit space-y-4">
          <h3 className="font-bold text-lg">Order Summary</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {items.map((i) => (
              <div key={i.product} className="flex gap-3 text-sm">
                <img src={i.image} className="h-12 w-12 rounded object-cover" />
                <div className="flex-1">
                  <p className="line-clamp-1">{i.title}</p>
                  <p className="text-muted-foreground">x{i.quantity}</p>
                </div>
                <p className="font-medium">{formatPrice(i.price * i.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 space-y-1 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(total)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{total > 100 ? 'Free' : '$10'}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>{formatPrice(total * 0.08)}</span></div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total</span><span>{formatPrice(total + (total > 100 ? 0 : 10) + total * 0.08)}</span>
            </div>
          </div>
          <Button type="submit" variant="gradient" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? 'Placing Order...' : 'Place Order'}
          </Button>
        </div>
      </form>
    </div>
  );
};
