import React, { useState, useEffect } from 'react';
import { Trash2, Edit, Plus, Copy } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../lib/api.js';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    minOrderAmount: '',
    maxDiscount: '',
    usageLimit: '',
    userLimit: '1',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
    isActive: true,
  });

  const API_BASE = API_BASE_URL;

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/admin/coupons`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      setCoupons(response.data.data.coupons);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = {
        ...formData,
        value: parseFloat(formData.value),
        minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : 0,
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        userLimit: parseInt(formData.userLimit),
      };

      if (editingId) {
        await axios.put(`${API_BASE}/admin/coupons/${editingId}`, data, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
      } else {
        await axios.post(`${API_BASE}/admin/coupons`, data, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
      }
      setShowModal(false);
      setFormData({
        code: '',
        type: 'percentage',
        value: '',
        minOrderAmount: '',
        maxDiscount: '',
        usageLimit: '',
        userLimit: '1',
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: '',
        isActive: true,
      });
      setEditingId(null);
      fetchCoupons();
    } catch (error) {
      console.error('Error saving coupon:', error);
      alert(error.response?.data?.message || 'Error saving coupon');
    }
  };

  const handleEdit = (coupon) => {
    setEditingId(coupon._id);
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minOrderAmount: coupon.minOrderAmount || '',
      maxDiscount: coupon.maxDiscount || '',
      usageLimit: coupon.usageLimit || '',
      userLimit: coupon.userLimit,
      validFrom: coupon.validFrom.split('T')[0],
      validUntil: coupon.validUntil ? coupon.validUntil.split('T')[0] : '',
      isActive: coupon.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;

    try {
      await axios.delete(`${API_BASE}/admin/coupons/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      fetchCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    alert('Coupon code copied!');
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Coupons Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Total Coupons: {coupons.length}
            </p>
          </div>
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({
                code: '',
                type: 'percentage',
                value: '',
                minOrderAmount: '',
                maxDiscount: '',
                usageLimit: '',
                userLimit: '1',
                validFrom: new Date().toISOString().split('T')[0],
                validUntil: '',
                isActive: true,
              });
              setShowModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={20} />
            Add Coupon
          </button>
        </div>

        {/* Coupons Table */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">Loading...</div>
          ) : coupons.length === 0 ? (
            <div className="p-8 text-center">No coupons found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Code</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Value</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Min Order</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Used</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {coupons.map((coupon) => (
                    <tr
                      key={coupon._id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      <td className="px-6 py-4 text-sm font-mono">{coupon.code}</td>
                      <td className="px-6 py-4 text-sm capitalize">{coupon.type}</td>
                      <td className="px-6 py-4 text-sm">
                        {coupon.value}
                        {coupon.type === 'percentage' ? '%' : '$'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        ${coupon.minOrderAmount}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {coupon.usedCount}/{coupon.usageLimit || '∞'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            coupon.isActive
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                          }`}
                        >
                          {coupon.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm flex justify-center gap-2">
                        <button
                          onClick={() => copyToClipboard(coupon.code)}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-600 rounded"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(coupon)}
                          className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                        >
                          <Edit size={16} className="text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon._id)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">
              {editingId ? 'Edit Coupon' : 'Add Coupon'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Value</label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({ ...formData, value: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Min Order Amount
                  </label>
                  <input
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minOrderAmount: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Max Discount
                  </label>
                  <input
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) =>
                      setFormData({ ...formData, maxDiscount: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, usageLimit: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    User Limit
                  </label>
                  <input
                    type="number"
                    value={formData.userLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, userLimit: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Valid From
                  </label>
                  <input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) =>
                      setFormData({ ...formData, validFrom: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Valid Until
                  </label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) =>
                      setFormData({ ...formData, validUntil: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  id="isActive"
                />
                <label htmlFor="isActive" className="text-sm">
                  Active
                </label>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminCoupons;
