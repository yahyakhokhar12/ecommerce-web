import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [sortBy, setSortBy] = useState('default');
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchProducts = useCallback(async () => {
    try {
      const res = await axios.get('/api/products');
      const list = Array.isArray(res.data) ? res.data : [];
      setProducts(list);
      setFilteredProducts(list);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  }, []);

  const filterAndSortProducts = useCallback(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
      return matchesSearch && matchesPrice;
    });

    if (sortBy === 'priceLow') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'priceHigh') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    setFilteredProducts(filtered);
  }, [products, priceRange.max, priceRange.min, searchTerm, sortBy]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    filterAndSortProducts();
  }, [filterAndSortProducts]);

  const addToCart = async (productId, e) => {
    e.stopPropagation();
    if (!user) {
      alert('Please login to add items to cart');
      return;
    }

    try {
      await axios.post('/api/cart/add',
        { productId, quantity: 1 },
        { headers: { 'x-auth-token': localStorage.getItem('token') } }
      );
      alert('âœ… Product added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('âŒ Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="empty-state">Loading products...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="stack">
          <div>
            <h1>Our Products</h1>
            <p className="muted">Find your next favorite. Fast filters, clean layout.</p>
          </div>

          <div className="filters">
            <div className="filters__row">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="select"
              >
                <option value="default">Sort: Featured</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>

            <div className="filters__row">
              <span className="muted">Price range</span>
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                className="input"
              />
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                className="input"
              />
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="empty-state">No products match your criteria.</div>
          ) : (
            <>
              <div className="muted">Found {filteredProducts.length} products</div>
              <div className="products-grid">
                {filteredProducts.map(product => (
                  <div
                    key={product._id}
                    className="product-card"
                    onClick={() => navigate(`/product/${product._id}`)}
                  >
                    <img
                      src={product.image || 'https://via.placeholder.com/300'}
                      alt={product.title}
                      className="product-card__img"
                    />
                    <h3>{product.title}</h3>
                    <p className="muted">
                      {(product.description || '').substring(0, 80)}...
                    </p>
                    <div className="price">${Number(product.price || 0).toFixed(2)}</div>
                    <button
                      className="btn btn--primary btn--block"
                      onClick={(e) => addToCart(product._id, e)}
                    >
                      Add to Cart ðŸ›’
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
