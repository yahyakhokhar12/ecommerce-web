import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="nav">
      <div className="nav__inner">
        <Link to="/" className="brand">
          <img src="/shop-logo.svg" alt="MyShop" className="brand__logo" />
        </Link>

        <div className="nav__links">
          {!user ? (
            <>
              <Link to="/" className="nav__link">Home</Link>
              <Link to="/products" className="nav__link">Products</Link>
              <Link to="/login" className="nav__link">Login</Link>
              <Link to="/register" className="nav__link">Register</Link>
            </>
          ) : (
            <>
              <Link to="/" className="nav__link">Home</Link>
              <Link to="/products" className="nav__link">Products</Link>
              <Link to="/cart" className="nav__link">ðŸ›’ Cart</Link>
              <Link to="/orders" className="nav__link">ðŸ“¦ Orders</Link>
              <Link to="/wishlist" className="nav__link">â¤ï¸ Wishlist</Link>
              {user.isAdmin && (
                <Link to="/admin" className="nav__link">âš™ï¸ Admin</Link>
              )}
              <span className="nav__pill">ðŸ‘¤ {user.name}</span>
              <button className="btn btn--ghost" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
