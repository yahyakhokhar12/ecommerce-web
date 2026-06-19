import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ProductReviews from '../components/ProductReviews';

const ProductDetail = () => {
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchProductDetails = useCallback(async () => {
    try {
      const res = await axios.get(`/api/products/${id}`);
      const payload = res.data?.product
        ? res.data
        : { product: res.data, reviews: [], averageRating: 0, reviewCount: 0 };
      setProductData(payload);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching product:', error);
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProductDetails();
  }, [fetchProductDetails]);

  const addToCart = async () => {
    if (!user) {
      alert('Please login to add items to cart');
      return;
    }

    try {
      await axios.post('/api/cart/add',
        { productId: id, quantity: 1 },
        { headers: { 'x-auth-token': localStorage.getItem('token') } }
      );
      alert('âœ… Product added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('âŒ Failed to add to cart');
    }
  };

  const addToWishlist = async () => {
    if (!user) {
      alert('Please login to add items to wishlist');
      return;
    }

    try {
      await axios.post(`/api/wishlist/add/${id}`, {}, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      alert('âœ… Added to wishlist!');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    }
  };

  const renderStars = (rating) => {
    return 'â˜…'.repeat(Math.round(rating)) + 'â˜†'.repeat(5 - Math.round(rating));
  };

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="empty-state">Loading product...</div>
        </div>
      </div>
    );
  }

  if (!productData?.product) {
    return (
      <div className="page">
        <div className="container">
          <div className="empty-state">Product not found</div>
        </div>
      </div>
    );
  }

  const { product, averageRating, reviewCount } = productData;

  return (
    <div className="page">
      <div className="container stack">
        <button className="btn btn--ghost" onClick={() => navigate(-1)}>
          â† Back
        </button>

        <div className="product-detail">
          <div>
            <img
              src={product.image || 'https://via.placeholder.com/500'}
              alt={product.title}
              className="product-detail__image"
            />
          </div>

          <div className="summary-card stack">
            <div>
              <h1>{product.title}</h1>
              <div className="muted">
                {renderStars(averageRating)} ({reviewCount} reviews)
              </div>
            </div>

            <p className="muted">{product.description || 'No description available.'}</p>

            <div className="price">${Number(product.price || 0).toFixed(2)}</div>

            <div className="stack">
              <button className="btn btn--primary btn--block" onClick={addToCart}>
                ðŸ›’ Add to Cart
              </button>
              <button className="btn btn--secondary btn--block" onClick={addToWishlist}>
                â¤ï¸ Add to Wishlist
              </button>
            </div>

            {product.category && (
              <div className="badge">Category: {product.category}</div>
            )}
          </div>
        </div>

        <ProductReviews productId={id} />
      </div>
    </div>
  );
};

export default ProductDetail;
