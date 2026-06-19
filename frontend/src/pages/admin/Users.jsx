import React, { useState, useEffect } from 'react';
import { Trash2, Edit, Lock, Unlock, Filter, Search, Plus } from 'lucide-react';
import axios from 'axios';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('edit'); // 'edit' or 'delete'

  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    fetchUsers();
  }, [page, filterRole, filterStatus]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      let url = `${API_BASE}/admin/users?page=${page}&limit=10`;

      if (filterRole !== 'all') {
        url += `&role=${filterRole}`;
      }
      if (filterStatus !== 'all') {
        url += `&isActive=${filterStatus === 'active'}`;
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      setUsers(response.data.data.users);
      setTotalUsers(response.data.data.totalUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim()) {
      try {
        const response = await axios.get(
          `${API_BASE}/admin/users-search?query=${value}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          }
        );
        setUsers(response.data.data);
      } catch (error) {
        console.error('Error searching users:', error);
      }
    } else {
      fetchUsers();
    }
  };

  const handleSuspend = async (userId) => {
    try {
      await axios.post(
        `${API_BASE}/admin/users/${userId}/suspend`,
        { reason: 'Suspended by admin' },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      fetchUsers();
    } catch (error) {
      console.error('Error suspending user:', error);
    }
  };

  const handleActivate = async (userId) => {
    try {
      await axios.post(
        `${API_BASE}/admin/users/${userId}/activate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      fetchUsers();
    } catch (error) {
      console.error('Error activating user:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      await axios.delete(`${API_BASE}/admin/users/${selectedUser._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      setShowModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await axios.put(
        `${API_BASE}/admin/users/${userId}/role`,
        { role: newRole },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      fetchUsers();
    } catch (error) {
      console.error('Error changing user role:', error);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Users Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Total Users: {totalUsers}
            </p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus size={20} />
            Add User
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
              />
            </div>

            {/* Role Filter */}
            <select
              value={filterRole}
              onChange={(e) => {
                setFilterRole(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
            >
              <option value="all">All Roles</option>
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">Loading...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No users found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Role</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Joined</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {users.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      <td className="px-6 py-4 text-sm">{user.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <select
                          value={user.role}
                          onChange={(e) => handleChangeRole(user._id, e.target.value)}
                          className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-sm"
                        >
                          <option value="customer">Customer</option>
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.isActive
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                          }`}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm flex justify-center gap-2">
                        <button className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded">
                          <Edit size={18} className="text-blue-600" />
                        </button>
                        {user.isActive ? (
                          <button
                            onClick={() => handleSuspend(user._id)}
                            className="p-2 hover:bg-yellow-100 dark:hover:bg-yellow-900 rounded"
                          >
                            <Lock size={18} className="text-yellow-600" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(user._id)}
                            className="p-2 hover:bg-green-100 dark:hover:bg-green-900 rounded"
                          >
                            <Unlock size={18} className="text-green-600" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setModalMode('delete');
                            setShowModal(true);
                          }}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                        >
                          <Trash2 size={18} className="text-red-600" />
                        </button>
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
          <button
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 border rounded-lg"
          >
            Next
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showModal && modalMode === 'delete' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Delete User</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminUsers;
