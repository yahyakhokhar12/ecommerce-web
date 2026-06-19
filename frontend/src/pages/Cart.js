import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
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

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const res = await axios.put(`/api/cart/update/${productId}`,
        { quantity: newQuantity },
        { headers: { 'x-auth-token': localStorage.getItem('token') } }
      );
      setCart(res.data);
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  const removeItem = async (productId) => {
    try {
      const res = await axios.delete(`/api/cart/remove/${productId}`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setCart(res.data);
    } catch (error) {
      console.error('Error removing item:', error);
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
          <div className="empty-state">Please login to view your cart</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="empty-state">Loading cart...</div>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="page">
        <div className="container">
          <div className="empty-state">Your cart is empty</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container stack">
        <h1>Shopping Cart</h1>

        <div className="summary-card">
          <div className="grid-list">
            {cart.items.map(item => (
              <div key={item.product._id} className="filters__row" style={{ justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ marginBottom: '0.25rem' }}>{item.product.title}</h3>
                  <span className="muted">Price: ${item.product.price}</span>
                </div>
                <div className="filters__row">
                  <button
                    className="btn btn--secondary"
                    onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    className="btn btn--secondary"
                    onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                  >
                    +
                  </button>
                  <button
                    className="btn btn--danger"
                    onClick={() => removeItem(item.product._id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="summary-card stack">
          <h2>Total: ${calculateTotal().toFixed(2)}</h2>
          <button className="btn btn--success btn--block" onClick={() => navigate('/checkout')}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
