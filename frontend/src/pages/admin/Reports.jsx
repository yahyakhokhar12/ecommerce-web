import React, { useState } from 'react';
import { Download, Calendar, TrendingUp } from 'lucide-react';
import axios from 'axios';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminReports = () => {
  const [reportType, setReportType] = useState('sales');
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_BASE = 'http://localhost:5000/api';

  const reportTypes = [
    { value: 'sales', label: 'Sales Report', icon: '📊' },
    { value: 'products', label: 'Product Performance', icon: '📦' },
    { value: 'customers', label: 'Customer Report', icon: '👥' },
    { value: 'revenue', label: 'Revenue Report', icon: '💰' },
    { value: 'inventory', label: 'Inventory Report', icon: '📦' },
  ];

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      const url = `${API_BASE}/admin/reports/${reportType}?startDate=${startDate}&endDate=${endDate}`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      setReportData(response.data.data);
    } catch (error) {
      console.error('Error generating report:', error);
      alert(error.response?.data?.message || 'Error generating report');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      let url = `${API_BASE}/admin/reports/export?reportType=${reportType}`;
      if (reportType !== 'inventory') {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url_link = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url_link;
      a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url_link);
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Error exporting report');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Reports & Analytics
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Generate and export business reports
          </p>
        </div>

        {/* Report Type Selection */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {reportTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => {
                setReportType(type.value);
                setReportData(null);
              }}
              className={`p-4 rounded-lg border-2 transition-all text-center ${
                reportType === type.value
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div className="text-2xl mb-2">{type.icon}</div>
              <p className="text-sm font-medium">{type.label}</p>
            </button>
          ))}
        </div>

        {/* Date Range Selection */}
        {reportType !== 'inventory' && (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Calendar size={20} />
              Date Range
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
                />
              </div>
            </div>
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <TrendingUp size={20} />
              Generate Report
            </button>
          </div>
        )}

        {reportType === 'inventory' && (
          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
          >
            <TrendingUp size={20} />
            Generate Report
          </button>
        )}

        {/* Report Data Display */}
        {reportData && (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Report Data</h2>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
              >
                <Download size={20} />
                Export as CSV
              </button>
            </div>

            {/* Sales Report */}
            {reportType === 'sales' && Array.isArray(reportData) && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-700">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold">
                        Date
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">
                        Orders
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">
                        Revenue
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">
                        Avg Order
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">
                        Items
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {reportData.map((row, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 text-sm">{row._id}</td>
                        <td className="px-4 py-2 text-sm">{row.totalOrders}</td>
                        <td className="px-4 py-2 text-sm font-semibold">
                          ${row.totalRevenue.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          ${row.averageOrderValue.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-sm">{row.totalItems}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Product Report */}
            {reportType === 'products' && Array.isArray(reportData) && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-700">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold">
                        Product
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">
                        SKU
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">
                        Sold
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">
                        Revenue
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">
                        Orders
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {reportData.map((row, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 text-sm">{row.product}</td>
                        <td className="px-4 py-2 text-sm">{row.sku}</td>
                        <td className="px-4 py-2 text-sm">{row.unitsSold}</td>
                        <td className="px-4 py-2 text-sm font-semibold">
                          ${row.revenue.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-sm">{row.orders}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Customer Report */}
            {reportType === 'customers' && Array.isArray(reportData) && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-700">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold">
                        Customer
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">
                        Email
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">
                        Orders
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">
                        Total Spent
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">
                        Avg Order
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {reportData.map((row, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 text-sm">{row.customer}</td>
                        <td className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">
                          {row.email}
                        </td>
                        <td className="px-4 py-2 text-sm">{row.totalOrders}</td>
                        <td className="px-4 py-2 text-sm font-semibold">
                          ${row.totalSpent.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          ${row.averageOrderValue.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Revenue Report */}
            {reportType === 'revenue' && Array.isArray(reportData) && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-700">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold">
                        Date
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">
                        Revenue
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">
                        Transactions
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">
                        Avg Transaction
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {reportData.map((row, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 text-sm">{row._id}</td>
                        <td className="px-4 py-2 text-sm font-semibold">
                          ${row.totalRevenue.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-sm">{row.transactionCount}</td>
                        <td className="px-4 py-2 text-sm">
                          ${row.averageTransaction.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Inventory Report */}
            {reportType === 'inventory' && typeof reportData === 'object' && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Total Products
                  </p>
                  <p className="text-2xl font-bold">
                    {reportData.totalProducts}
                  </p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <p className="text-sm text-yellow-600 mb-1">Out of Stock</p>
                  <p className="text-2xl font-bold">{reportData.outOfStock}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <p className="text-sm text-red-600 mb-1">Low Stock</p>
                  <p className="text-2xl font-bold">{reportData.lowStock}</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg col-span-2 md:col-span-1">
                  <p className="text-sm text-blue-600 mb-1">
                    Total Stock Value
                  </p>
                  <p className="text-2xl font-bold">
                    ${reportData.totalInventoryValue?.toFixed(2) || 0}
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <p className="text-sm text-green-600 mb-1">
                    Avg Stock/Product
                  </p>
                  <p className="text-2xl font-bold">
                    {reportData.averageStockPerProduct?.toFixed(0) || 0}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminReports;
