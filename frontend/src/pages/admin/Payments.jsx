import React, { useState, useEffect } from 'react';
import { RefreshCw, Download, Filter, Search } from 'lucide-react';
import axios from 'axios';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [refundModal, setRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');

  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    fetchPayments();
  }, [page, filterStatus]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      let url = `${API_BASE}/admin/payments?page=${page}&limit=10`;

      if (filterStatus !== 'all') {
        url += `&status=${filterStatus}`;
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      setPayments(response.data.data.payments);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (value) => {
    setSearchTerm(value);

    if (value.trim()) {
      try {
        const response = await axios.get(`${API_BASE}/admin/payments-search?query=${value}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        setPayments(response.data.data);
      } catch (error) {
        console.error('Error searching payments:', error);
      }
    } else {
      fetchPayments();
    }
  };

  const handleRefund = async () => {
    if (!selectedPayment || !refundAmount) return;

    try {
      await axios.post(
        `${API_BASE}/admin/payments/${selectedPayment._id}/refund`,
        {
          refundAmount: parseFloat(refundAmount),
          refundReason,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      setRefundModal(false);
      setRefundAmount('');
      setRefundReason('');
      setSelectedPayment(null);
      fetchPayments();
    } catch (error) {
      console.error('Error processing refund:', error);
      alert(error.response?.data?.message || 'Error processing refund');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      paid: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
      pending: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
      failed: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
      refunded: 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200',
    };
    return colors[status] || colors.pending;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Payments Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage transactions and refunds
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search transaction ID..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">Loading...</div>
          ) : payments.length === 0 ? (
            <div className="p-8 text-center">No payments found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Transaction ID
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Date
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {payments.map((payment) => (
                    <tr
                      key={payment._id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      <td className="px-6 py-4 text-sm font-mono text-slate-600">
                        {payment.transactionId?.substring(0, 10)}...
                      </td>
                      <td className="px-6 py-4 text-sm">{payment.user?.name}</td>
                      <td className="px-6 py-4 text-sm font-semibold">
                        ${payment.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm capitalize">
                        {payment.paymentMethod}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        {payment.status === 'paid' && (
                          <button
                            onClick={() => {
                              setSelectedPayment(payment);
                              setRefundAmount(payment.amount.toString());
                              setRefundModal(true);
                            }}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
                          >
                            Refund
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">Page {page}</span>
          <button onClick={() => setPage(page + 1)} className="px-4 py-2 border rounded-lg">
            Next
          </button>
        </div>
      </div>

      {/* Refund Modal */}
      {refundModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Process Refund</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Original Amount: ${selectedPayment.amount.toFixed(2)}
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Refund Amount
                </label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  max={selectedPayment.amount}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Reason
                </label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
                  rows="3"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setRefundModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleRefund}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Process Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminPayments;
