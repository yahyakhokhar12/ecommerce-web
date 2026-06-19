import React, { useState, useEffect } from 'react';
import { Trash2, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);

  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    fetchReviews();
  }, [page, filterStatus]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      let url = `${API_BASE}/admin/reviews?page=${page}&limit=10`;

      if (filterStatus === 'pending') {
        url = `${API_BASE}/admin/reviews-pending`;
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      setReviews(response.data.data.reviews || response.data.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.post(
        `${API_BASE}/admin/reviews/${id}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      fetchReviews();
    } catch (error) {
      console.error('Error approving review:', error);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await axios.post(
        `${API_BASE}/admin/reviews/${id}/reject`,
        { reason },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      fetchReviews();
    } catch (error) {
      console.error('Error rejecting review:', error);
    }
  };

  const handleToggleVisibility = async (id) => {
    try {
      await axios.post(
        `${API_BASE}/admin/reviews/${id}/toggle-visibility`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      fetchReviews();
    } catch (error) {
      console.error('Error toggling visibility:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;

    try {
      await axios.delete(`${API_BASE}/admin/reviews/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Reviews Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Moderate customer reviews
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
          >
            <option value="all">All Reviews</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
          </select>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {loading ? (
            <div className="p-8 text-center">Loading...</div>
          ) : reviews.length === 0 ? (
            <div className="p-8 text-center">No reviews found</div>
          ) : (
            reviews.map((review) => (
              <div
                key={review._id}
                className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-semibold text-lg">{review.title}</p>
                    <div className="flex gap-4 text-sm text-slate-600 dark:text-slate-400 mt-1">
                      <span>Product: {review.product?.title}</span>
                      <span>User: {review.user?.name}</span>
                      <span>Rating: {review.rating}/5</span>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      review.isApproved
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                    }`}
                  >
                    {review.isApproved ? 'Approved' : 'Pending'}
                  </span>
                </div>

                <p className="text-slate-700 dark:text-slate-300 mb-4">
                  {review.comment}
                </p>

                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Posted on {new Date(review.createdAt).toLocaleDateString()}
                </p>

                <div className="flex gap-3">
                  {!review.isApproved && (
                    <button
                      onClick={() => handleApprove(review._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
                    >
                      <CheckCircle size={16} />
                      Approve
                    </button>
                  )}
                  {!review.isApproved && (
                    <button
                      onClick={() => handleReject(review._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm"
                    >
                      <XCircle size={16} />
                      Reject
                    </button>
                  )}
                  <button
                    onClick={() => handleToggleVisibility(review._id)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                  >
                    {review.isHidden ? (
                      <>
                        <Eye size={16} />
                        Show
                      </>
                    ) : (
                      <>
                        <EyeOff size={16} />
                        Hide
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(review._id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {filterStatus === 'all' && (
          <div className="flex justify-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2">Page {page}</span>
            <button
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 border rounded-lg"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminReviews;
