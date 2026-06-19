import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      const res = await axios.get('/api/wishlist', {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setWishlist(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const res = await axios.delete(`/api/wishlist/remove/${productId}`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setWishlist(res.data);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const addToCart = async (productId) => {
    try {
      await axios.post('/api/cart/add',
        { productId, quantity: 1 },
        { headers: { 'x-auth-token': localStorage.getItem('token') } }
      );
      alert('âœ… Product added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  if (!user) {
    return (
      <div className="page">
        <div className="container">
          <div className="empty-state">Please login to view your wishlist</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="empty-state">Loading wishlist...</div>
        </div>
      </div>
    );
  }

  if (!wishlist || !wishlist.products || wishlist.products.length === 0) {
    return (
      <div className="page">
        <div className="container">
          <div className="empty-state">
            Your wishlist is empty. <Link to="/products">Browse products</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container stack">
        <h1>My Wishlist â¤ï¸</h1>
        <div className="products-grid">
          {wishlist.products.map(product => (
            <div key={product._id} className="product-card">
              <button
                className="btn btn--danger"
                onClick={() => removeFromWishlist(product._id)}
              >
                Remove
              </button>
              <img
                src={product.image || 'https://via.placeholder.com/300'}
                alt={product.title}
                className="product-card__img"
              />
              <h3>{product.title}</h3>
              <div className="price">${product.price.toFixed(2)}</div>
              <button className="btn btn--primary btn--block" onClick={() => addToCart(product._id)}>
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
