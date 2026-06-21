import React, { useState, useEffect } from 'react';
import { Trash2, Edit, Plus, Sparkles } from 'lucide-react';
import axios from 'axios';
import { apiUrl } from '../../lib/api.js';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    isActive: true,
  });

  const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(apiUrl('/admin/categories?limit=100&sort=name'), {
        headers: authHeaders(),
      });
      setCategories(response.data.data?.categories || response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Could not load categories. Check backend server and admin login.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setStatus({ type: '', message: '' });
      const payload = {
        ...formData,
        slug: formData.slug.trim(),
        name: formData.name.trim(),
        description: formData.description.trim(),
      };

      if (editingId) {
        await axios.put(
          apiUrl(`/admin/categories/${editingId}`),
          payload,
          {
            headers: authHeaders(),
          }
        );
      } else {
        await axios.post(apiUrl('/admin/categories'), payload, {
          headers: authHeaders(),
        });
      }
      setShowModal(false);
      setFormData({ name: '', slug: '', description: '', isActive: true });
      setEditingId(null);
      setStatus({
        type: 'success',
        message: editingId ? 'Category updated successfully.' : 'Category added successfully.',
      });
      await fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Could not save category.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category) => {
    setEditingId(category._id);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description,
      isActive: category.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;

    try {
      await axios.delete(apiUrl(`/admin/categories/${id}`), {
        headers: authHeaders(),
      });
      setStatus({ type: 'success', message: 'Category deleted successfully.' });
      await fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Could not delete category.',
      });
    }
  };

  const handleSeedDefaults = async () => {
    try {
      setSeeding(true);
      await axios.post(apiUrl('/admin/categories/seed-defaults'), {}, {
        headers: authHeaders(),
      });
      setStatus({ type: 'success', message: 'Default categories added. Existing categories were kept.' });
      await fetchCategories();
    } catch (error) {
      console.error('Error adding default categories:', error);
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Could not add default categories. Make sure you are logged in as admin.',
      });
    } finally {
      setSeeding(false);
    }
  };

  const handleOpenNew = () => {
    setEditingId(null);
    setFormData({ name: '', slug: '', description: '', isActive: true });
    setShowModal(true);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Categories Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Total Categories: {categories.length}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleSeedDefaults}
              disabled={seeding}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 font-semibold text-cyan-100 shadow-lg shadow-cyan-950/20 transition hover:border-cyan-300/60 hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Sparkles size={18} />
              {seeding ? 'Adding...' : 'Add Default Categories'}
            </button>
            <button
              type="button"
              onClick={handleOpenNew}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500"
            >
              <Plus size={20} />
              Add Category
            </button>
          </div>
        </div>

        {status.message && (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              status.type === 'error'
                ? 'border-red-400/30 bg-red-500/10 text-red-200'
                : 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
            }`}
          >
            {status.message}
          </div>
        )}

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="rounded-xl border border-white/10 bg-slate-900/80 p-5 text-slate-300">
              Loading categories...
            </div>
          ) : categories.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-cyan-400/30 bg-slate-950/70 p-8 text-center text-slate-300">
              No categories found. Use Add Default Categories to create the main store categories.
            </div>
          ) : (
            categories.map((category) => (
              <div
                key={category._id}
                className="rounded-2xl border border-white/10 bg-slate-950/75 p-5 shadow-xl shadow-black/20"
              >
                <h3 className="mb-2 text-lg font-bold text-white">{category.name}</h3>
                <p className="mb-4 min-h-[40px] text-sm text-slate-400">
                  {category.description}
                </p>
                <p className="mb-4 text-xs text-slate-500">Slug: {category.slug}</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 ${
                    category.isActive
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                  }`}
                >
                  {category.isActive ? 'Active' : 'Inactive'}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category._id)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">
              {editingId ? 'Edit Category' : 'Add Category'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
                  rows="3"
                />
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
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminCategories;
