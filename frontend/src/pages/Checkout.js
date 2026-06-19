import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      const res = await axios.get('/api/cart', {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setCart(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    setProcessing(true);
    try {
      await axios.post('/api/orders',
        { paymentMethod: 'Cash on Delivery' },
        { headers: { 'x-auth-token': localStorage.getItem('token') } }
      );
      setOrderPlaced(true);
      setTimeout(() => {
        navigate('/products');
      }, 3000);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order');
    } finally {
      setProcessing(false);
    }
  };

  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  if (!user) {
    return (
      <div className="page">
        <div className="container">
          <div className="empty-state">Please login to checkout</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="empty-state">Loading...</div>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="page">
        <div className="container">
          <div className="empty-state">âœ… Order Placed Successfully! Redirecting...</div>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="page">
        <div className="container stack">
          <div className="empty-state">Your cart is empty</div>
          <button onClick={() => navigate('/products')} className="btn btn--primary">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container stack">
        <h1>Checkout</h1>

        <div className="summary-card stack">
          <h2>Order Summary</h2>
          <div className="grid-list">
            {cart.items.map(item => (
              <div key={item.product._id} className="filters__row" style={{ justifyContent: 'space-between' }}>
                <div>
                  <strong>{item.product.title}</strong>
                  <div className="muted">Quantity: {item.quantity}</div>
                </div>
                <div className="price">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="filters__row" style={{ justifyContent: 'space-between' }}>
            <span>Total Amount:</span>
            <span className="price">${calculateTotal().toFixed(2)}</span>
          </div>

          <div className="badge">ðŸ’µ Cash on Delivery</div>

          <button
            className="btn btn--success btn--block"
            onClick={handleCheckout}
            disabled={processing}
          >
            {processing ? 'Processing...' : 'Place Order'}
          </button>

          <button
            className="btn btn--secondary btn--block"
            onClick={() => navigate('/cart')}
          >
            Back to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
