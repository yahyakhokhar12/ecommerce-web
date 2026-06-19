import React, { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, Edit } from 'lucide-react';
import axios from 'axios';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('all');
  const [editModal, setEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustmentData, setAdjustmentData] = useState({
    quantity: '',
    reason: 'manual_adjustment',
    notes: '',
  });

  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    fetchInventory();
  }, [tab]);

  const fetchInventory = async () => {
    try {
      setLoading(true);

      if (tab === 'all') {
        const response = await axios.get(`${API_BASE}/admin/inventory`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        setInventory(response.data.data.inventory);
      } else if (tab === 'low-stock') {
        const response = await axios.get(`${API_BASE}/admin/inventory-low-stock`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        setLowStockProducts(response.data.data);
      } else if (tab === 'out-of-stock') {
        const response = await axios.get(
          `${API_BASE}/admin/inventory-out-of-stock`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          }
        );
        setOutOfStockProducts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustStock = async () => {
    if (!selectedProduct || !adjustmentData.quantity) return;

    try {
      await axios.put(
        `${API_BASE}/admin/inventory/${selectedProduct._id}/stock`,
        {
          quantity: parseInt(adjustmentData.quantity),
          reason: adjustmentData.reason,
          notes: adjustmentData.notes,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      setEditModal(false);
      setSelectedProduct(null);
      setAdjustmentData({ quantity: '', reason: 'manual_adjustment', notes: '' });
      fetchInventory();
    } catch (error) {
      console.error('Error adjusting stock:', error);
      alert(error.response?.data?.message || 'Error adjusting stock');
    }
  };

  const renderTable = (data) => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50 dark:bg-slate-700">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold">
              Product
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold">SKU</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Stock</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Price</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
            <th className="px-6 py-3 text-center text-sm font-semibold">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {data.map((item) => (
            <tr
              key={item._id}
              className="hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <td className="px-6 py-4 text-sm font-medium">{item.title}</td>
              <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                {item.sku}
              </td>
              <td className="px-6 py-4 text-sm font-semibold">{item.stock}</td>
              <td className="px-6 py-4 text-sm">${item.price}</td>
              <td className="px-6 py-4 text-sm">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    item.outOfStock
                      ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      : item.lowStock
                      ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                      : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                  }`}
                >
                  {item.outOfStock
                    ? 'Out of Stock'
                    : item.lowStock
                    ? 'Low Stock'
                    : 'In Stock'}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-center">
                <button
                  onClick={() => {
                    setSelectedProduct(item);
                    setEditModal(true);
                  }}
                  className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                >
                  <Edit size={18} className="text-blue-600" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Inventory Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Track and manage product stock levels
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setTab('all')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              tab === 'all'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 dark:text-slate-400'
            }`}
          >
            All Products
          </button>
          <button
            onClick={() => setTab('low-stock')}
            className={`px-4 py-2 border-b-2 transition-colors flex items-center gap-2 ${
              tab === 'low-stock'
                ? 'border-yellow-600 text-yellow-600'
                : 'border-transparent text-slate-600 dark:text-slate-400'
            }`}
          >
            <AlertTriangle size={18} />
            Low Stock
          </button>
          <button
            onClick={() => setTab('out-of-stock')}
            className={`px-4 py-2 border-b-2 transition-colors flex items-center gap-2 ${
              tab === 'out-of-stock'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-600 dark:text-slate-400'
            }`}
          >
            <AlertCircle size={18} />
            Out of Stock
          </button>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">Loading...</div>
          ) : tab === 'all' && inventory.length === 0 ? (
            <div className="p-8 text-center">No products found</div>
          ) : tab === 'low-stock' && lowStockProducts.length === 0 ? (
            <div className="p-8 text-center">No low stock products</div>
          ) : tab === 'out-of-stock' && outOfStockProducts.length === 0 ? (
            <div className="p-8 text-center">No out of stock products</div>
          ) : (
            renderTable(
              tab === 'all'
                ? inventory
                : tab === 'low-stock'
                ? lowStockProducts
                : outOfStockProducts
            )
          )}
        </div>
      </div>

      {/* Edit Stock Modal */}
      {editModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Adjust Stock</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">
                  {selectedProduct.title}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Current Stock: {selectedProduct.stock}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Quantity Change
                </label>
                <input
                  type="number"
                  value={adjustmentData.quantity}
                  onChange={(e) =>
                    setAdjustmentData({
                      ...adjustmentData,
                      quantity: e.target.value,
                    })
                  }
                  placeholder="e.g., +5 or -3"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Reason
                </label>
                <select
                  value={adjustmentData.reason}
                  onChange={(e) =>
                    setAdjustmentData({
                      ...adjustmentData,
                      reason: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
                >
                  <option value="manual_adjustment">Manual Adjustment</option>
                  <option value="stock_received">Stock Received</option>
                  <option value="damage">Damage</option>
                  <option value="return_processed">Return Processed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={adjustmentData.notes}
                  onChange={(e) =>
                    setAdjustmentData({
                      ...adjustmentData,
                      notes: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
                  rows="3"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setEditModal(false);
                  setSelectedProduct(null);
                  setAdjustmentData({
                    quantity: '',
                    reason: 'manual_adjustment',
                    notes: '',
                  });
                }}
                className="px-4 py-2 border rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustStock}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminInventory;
