import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  const fetchProductDetails = useCallback(async () => {
    try {
      const res = await axios.get(`/api/products/${productId}`);
      const payload = res.data?.product
        ? res.data
        : { reviews: [], averageRating: 0, reviewCount: 0 };
      setReviews(payload.reviews || []);
      setAverageRating(payload.averageRating || 0);
      setReviewCount(payload.reviewCount || 0);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProductDetails();
  }, [fetchProductDetails]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to write a review');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`/api/products/${productId}/reviews`,
        newReview,
        { headers: { 'x-auth-token': localStorage.getItem('token') } }
      );
      setNewReview({ rating: 5, comment: '' });
      fetchProductDetails();
      alert('âœ… Review added successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add review');
    }
    setSubmitting(false);
  };

  const renderStars = (rating) => {
    return 'â˜…'.repeat(rating) + 'â˜†'.repeat(5 - rating);
  };

  if (loading) return <div className="empty-state">Loading reviews...</div>;

  return (
    <div className="summary-card stack">
      <div>
        <h3>Customer Reviews</h3>
        <div className="filters__row">
          <div className="price">{averageRating.toFixed(1)}</div>
          <div className="muted">{renderStars(Math.round(averageRating))}</div>
          <div className="muted">{reviewCount} reviews</div>
        </div>
      </div>

      {user && (
        <form onSubmit={handleSubmitReview} className="stack">
          <div className="form-field">
            <label>Rating</label>
            <select
              value={newReview.rating}
              onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value, 10) })}
              className="select"
            >
              {[5, 4, 3, 2, 1].map(num => (
                <option key={num} value={num}>{num} stars {renderStars(num)}</option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label>Your review</label>
            <textarea
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              placeholder="Write your review here..."
              rows="3"
              className="textarea"
              required
            />
          </div>
          <button className="btn btn--primary" type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}

      {reviews.length === 0 ? (
        <p className="muted">No reviews yet. Be the first to review!</p>
      ) : (
        <div className="grid-list">
          {reviews.map(review => (
            <div key={review._id} className="review-card">
              <div className="filters__row" style={{ justifyContent: 'space-between' }}>
                <strong>{review.userName}</strong>
                <span className="muted">{renderStars(review.rating)}</span>
              </div>
              <p>{review.comment}</p>
              <small className="muted">
                {new Date(review.createdAt).toLocaleDateString()}
              </small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
