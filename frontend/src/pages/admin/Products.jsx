import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Star, ImagePlus, X, Sparkles } from 'lucide-react';
import axios from 'axios';
import { apiUrl } from '../../lib/api.js';
import { getProductImage, PRODUCT_PLACEHOLDER, resolveImageUrl } from '../../lib/productImage.js';

export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [seedingCategories, setSeedingCategories] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    brand: '',
    sku: '',
    price: '',
    discount: '',
    stock: '',
    category: '',
    isFeatured: false,
  });

  const ITEMS_PER_PAGE = 10;
  const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    document.body.style.overflow = showModal ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [showModal]);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, selectedCategory, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(apiUrl('/products'), {
        headers: authHeaders(),
      });
      setProducts(response.data.data?.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Could not load products.',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      let response;
      try {
        response = await axios.get(apiUrl('/admin/categories?limit=100&sort=name'), {
          headers: authHeaders(),
        });
      } catch (_adminError) {
        response = await axios.get(apiUrl('/categories'));
      }

      const payload = response.data.data;
      const nextCategories = Array.isArray(payload) ? payload : payload?.categories || [];
      setCategories(nextCategories);
      return nextCategories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Could not load product categories.',
      });
      return [];
    }
  };

  const handleSeedCategories = async () => {
    try {
      setSeedingCategories(true);
      setFormError('');
      await axios.post(apiUrl('/admin/categories/seed-defaults'), {}, {
        headers: authHeaders(),
      });
      const nextCategories = await fetchCategories();
      if (!formData.category && nextCategories[0]?._id) {
        setFormData((current) => ({ ...current, category: nextCategories[0]._id }));
      }
      setStatus({ type: 'success', message: 'Default categories added.' });
      return nextCategories;
    } catch (error) {
      setFormError(error.response?.data?.message || 'Could not add default categories.');
      return [];
    } finally {
      setSeedingCategories(false);
    }
  };

  const filterProducts = () => {
    let filtered = products.filter((product) => {
      const sku = product.sku || product.SKU || '';
      const matchesSearch =
        product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        !selectedCategory || product.category?._id === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description,
      brand: product.brand || '',
      sku: product.sku || '',
      price: product.price,
      discount: product.discount || '',
      stock: product.stock,
      category: product.category?._id || '',
      isFeatured: product.isFeatured || false,
    });
    setImageFiles([]);
    setImagePreviews(product.images?.map((image) => resolveImageUrl(image.url)) || []);
    setFormError('');
    setFieldErrors({});
    setShowModal(true);
  };

  const handleAddNew = async () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      description: '',
      brand: '',
      sku: '',
      price: '',
      discount: '',
      stock: '',
      category: '',
      isFeatured: false,
    });
    setImageFiles([]);
    setImagePreviews([]);
    setFormError('');
    setFieldErrors({});
    setShowModal(true);
    let availableCategories = categories;
    if (availableCategories.length === 0) {
      availableCategories = await fetchCategories();
    }
    if (availableCategories.length === 0) {
      availableCategories = await handleSeedCategories();
    }
    if (availableCategories[0]?._id) {
      setFormData((current) => ({ ...current, category: availableCategories[0]._id }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 5);
    setImageFiles(files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const buildProductPayload = () => {
    const payload = new FormData();
    payload.append('title', formData.title.trim());
    payload.append('description', formData.description.trim());
    payload.append('brand', formData.brand.trim());
    if (formData.sku.trim()) payload.append('sku', formData.sku.trim());
    payload.append('price', formData.price);
    payload.append('discount', formData.discount || 0);
    payload.append('stock', formData.stock);
    payload.append('category', formData.category);
    payload.append('isFeatured', String(formData.isFeatured));
    imageFiles.forEach((file) => payload.append('images', file));
    return payload;
  };

  const validateProductForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Product title is required';
    if (!formData.brand.trim()) errors.brand = 'Brand is required';
    if (!formData.description.trim() || formData.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }
    if (!formData.price || Number(formData.price) <= 0) errors.price = 'Enter a valid price';
    if (formData.discount && (Number(formData.discount) < 0 || Number(formData.discount) > 100)) {
      errors.discount = 'Discount must be between 0 and 100';
    }
    if (formData.stock === '' || Number(formData.stock) < 0) errors.stock = 'Enter valid stock';
    if (!formData.category) errors.category = 'Select a category';
    setFieldErrors(errors);
    setFormError(Object.keys(errors).length ? 'Please fix the highlighted fields.' : '');
    return Object.keys(errors).length === 0;
  };

  const normalizeApiValidationErrors = (details) => {
    const errors = {};
    details?.forEach((detail) => {
      const key = detail.field?.replace(/^body\./, '');
      if (key) errors[key] = detail.message;
    });
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFieldErrors({});
    if (!validateProductForm()) return;
    try {
      setSaving(true);
      const payload = buildProductPayload();
      if (editingProduct) {
        await axios.put(
          apiUrl(`/admin/products/${editingProduct._id}`),
          payload,
          {
            headers: authHeaders(),
          }
        );
      } else {
        await axios.post(apiUrl('/admin/products'), payload, {
          headers: authHeaders(),
        });
      }
      setShowModal(false);
      setStatus({
        type: 'success',
        message: editingProduct ? 'Product updated successfully.' : 'Product created successfully.',
      });
      await fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      const apiErrors = normalizeApiValidationErrors(error.response?.data?.details);
      setFieldErrors(apiErrors);
      setFormError(
        Object.keys(apiErrors).length
          ? 'Please fix the highlighted fields.'
          : error.response?.data?.message || 'Error saving product. Check required fields and try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(apiUrl(`/admin/products/${productId}`), {
          headers: authHeaders(),
        });
        setStatus({ type: 'success', message: 'Product deleted successfully.' });
        await fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        setStatus({
          type: 'error',
          message: error.response?.data?.message || 'Error deleting product.',
        });
      }
    }
  };

  const handleToggleFeatured = async (productId, currentStatus) => {
    try {
      await axios.put(
        apiUrl(`/admin/products/${productId}`),
        { isFeatured: !currentStatus },
        {
          headers: authHeaders(),
        }
      );
      setStatus({ type: 'success', message: 'Featured status updated.' });
      await fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Could not update product.',
      });
    }
  };

  const paginated = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-start rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/20">
          <div>
            <h1 className="text-3xl font-black text-white">
              Products Management
            </h1>
            <p className="text-slate-400">
              Manage catalog details, inventory, featured status, and product images.
            </p>
          </div>
          <button
            onClick={handleAddNew}
            className="rounded-xl bg-white px-4 py-2 font-semibold text-slate-950 shadow-lg shadow-black/20 transition hover:bg-slate-100"
          >
            + Add Product
          </button>
        </div>

        {/* Filters */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-xl shadow-black/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Search by title or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-teal-300/30"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-white outline-none focus:ring-2 focus:ring-teal-300/30"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
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

        {/* Products Table */}
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-xl shadow-black/20">
          {loading ? (
            <div className="p-8 text-center">Loading products...</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-white/10 bg-white/[0.05] text-slate-300">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">
                        SKU
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">
                        Featured
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {paginated.map((product) => (
                      <tr
                        key={product._id}
                        className="text-slate-200 hover:bg-white/[0.04]"
                      >
                        <td className="px-6 py-4 text-sm font-medium">
                          <div className="flex items-center gap-3">
                            <img
                              src={getProductImage(product)}
                              alt={product.title}
                              className="h-12 w-12 rounded-xl object-cover"
                              onError={(event) => {
                                event.currentTarget.src = PRODUCT_PLACEHOLDER;
                              }}
                            />
                            <div>
                            <p>{product.title}</p>
                            <p className="text-xs text-slate-500">
                              {product.description?.substring(0, 50)}...
                            </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">{product.sku || product.SKU || '-'}</td>
                        <td className="px-6 py-4 text-sm">
                          {product.category?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold">
                          ${product.finalPrice?.toFixed(2) || product.price?.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              product.stock > 0
                                ? 'bg-green-100 dark:bg-green-900/20 text-green-700'
                                : 'bg-red-100 dark:bg-red-900/20 text-red-700'
                            }`}
                          >
                            {product.stock} units
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() =>
                              handleToggleFeatured(
                                product._id,
                                product.isFeatured
                              )
                            }
                            className={`px-2 py-1 rounded text-xs font-medium transition ${
                              product.isFeatured
                                ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {product.isFeatured ? (
                              <>
                                <Star size={14} className="inline mr-1" />
                                Featured
                              </>
                            ) : (
                              'Not Featured'
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded text-blue-600"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(product._id)}
                              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-600"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} of{' '}
                  {filteredProducts.length} products
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="flex h-[min(760px,calc(100vh-2rem))] w-full max-w-5xl flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#101827] text-white shadow-2xl shadow-black/60">
              <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-5">
                <div>
                  <h2 className="text-2xl font-black">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">Add product details, inventory, and pictures in one clean frame.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-full border border-white/10 bg-white/[0.06] p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
                  aria-label="Close product modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                  {formError && (
                    <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                      {formError}
                    </div>
                  )}
                  <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Product Title *</label>
                        <input
                          type="text"
                          required
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none focus:ring-2 focus:ring-teal-300/30"
                        />
                        {fieldErrors.title && <p className="mt-1 text-xs text-red-300">{fieldErrors.title}</p>}
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium mb-1">Brand *</label>
                          <input
                            type="text"
                            required
                            value={formData.brand}
                            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                            className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none focus:ring-2 focus:ring-teal-300/30"
                          />
                          {fieldErrors.brand && <p className="mt-1 text-xs text-red-300">{fieldErrors.brand}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">SKU</label>
                          <input
                            type="text"
                            value={formData.sku}
                            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                            className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none focus:ring-2 focus:ring-teal-300/30"
                          />
                          {fieldErrors.sku && <p className="mt-1 text-xs text-red-300">{fieldErrors.sku}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows="6"
                          className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none focus:ring-2 focus:ring-teal-300/30"
                        />
                        {fieldErrors.description && <p className="mt-1 text-xs text-red-300">{fieldErrors.description}</p>}
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium mb-1">Original Price</label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none focus:ring-2 focus:ring-teal-300/30"
                          />
                          {fieldErrors.price && <p className="mt-1 text-xs text-red-300">{fieldErrors.price}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Discount %</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={formData.discount}
                            onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                            className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none focus:ring-2 focus:ring-teal-300/30"
                          />
                          {fieldErrors.discount && <p className="mt-1 text-xs text-red-300">{fieldErrors.discount}</p>}
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium mb-1">Stock</label>
                          <input
                            type="number"
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none focus:ring-2 focus:ring-teal-300/30"
                          />
                          {fieldErrors.stock && <p className="mt-1 text-xs text-red-300">{fieldErrors.stock}</p>}
                        </div>
                        <div>
                          <div className="mb-1 flex items-center justify-between gap-3">
                            <label className="block text-sm font-medium">Category</label>
                            {categories.length === 0 && (
                              <button
                                type="button"
                                onClick={handleSeedCategories}
                                disabled={seedingCategories}
                                className="inline-flex items-center gap-1 rounded-full border border-cyan-300/30 px-3 py-1 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-400/10 disabled:opacity-60"
                              >
                                <Sparkles className="h-3.5 w-3.5" />
                                {seedingCategories ? 'Adding...' : 'Add defaults'}
                              </button>
                            )}
                          </div>
                          <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full rounded-xl border border-white/10 bg-[#1f2937] px-4 py-3 text-white outline-none focus:ring-2 focus:ring-teal-300/30"
                          >
                            <option value="">Select Category</option>
                            {categories.length === 0 && (
                              <option value="" disabled>No categories available</option>
                            )}
                            {categories.map((cat) => (
                              <option key={cat._id} value={cat._id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                          {fieldErrors.category && <p className="mt-1 text-xs text-red-300">{fieldErrors.category}</p>}
                        </div>
                      </div>

                      <label className="flex w-fit items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3">
                        <input
                          type="checkbox"
                          checked={formData.isFeatured}
                          onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                          className="h-4 w-4 accent-teal-400"
                        />
                        <span className="text-sm font-medium">Featured Product</span>
                      </label>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Product Pictures</label>
                        <label className="flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/[0.04] p-6 text-center transition hover:bg-white/[0.07]">
                          <ImagePlus className="mb-3 h-10 w-10 text-teal-300" />
                          <span className="font-medium">Upload up to 5 product images</span>
                          <span className="mt-1 text-xs text-slate-400">PNG, JPG, WEBP up to 5MB each</span>
                          <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                        </label>
                      </div>

                      {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-2 gap-3">
                          {imagePreviews.map((src, index) => (
                            <div key={src} className="relative aspect-square overflow-hidden rounded-2xl border border-white/10">
                              <img src={src} alt={`Product preview ${index + 1}`} className="h-full w-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 gap-3 border-t border-white/10 bg-[#0b1220] px-6 py-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 rounded-xl border border-white/10 px-4 py-3 font-semibold text-slate-200 transition hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 rounded-xl bg-white px-4 py-3 font-semibold text-slate-950 transition hover:bg-slate-100"
                  >
                    {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminProducts;
