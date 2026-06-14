import { useState } from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { Menu, Search, ShoppingCart, User, X, Heart, LogOut, Package } from 'lucide-react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '../common/Logo.jsx';
import { ThemeToggle } from '../common/ThemeToggle.jsx';
import { Button } from '../ui/button.jsx';
import { Badge } from '../ui/badge.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { selectCartCount } from '../../features/cart/cartSlice.js';
import { selectWishlistCount } from '../../features/wishlist/wishlistSlice.js';

export const Header = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const cartCount = useSelector(selectCartCount);
  const wishlistCount = useSelector(selectWishlistCount);
  const { user, isAuthenticated, signOut } = useAuth();

  const links = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Products' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?search=${search}`);
  };

  return (
    <header className="sticky top-0 z-50 w-full glass border-b">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-primary ${isActive ? 'text-primary' : 'text-foreground/70'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <form onSubmit={handleSearch} className="hidden lg:flex relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full h-10 pl-10 pr-4 rounded-full border bg-background/50 focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </form>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link to="/wishlist" className="relative p-2">
            <Heart className="h-5 w-5" />
            {wishlistCount > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                {wishlistCount}
              </Badge>
            )}
          </Link>
          <Link to="/cart" className="relative p-2">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                {cartCount}
              </Badge>
            )}
          </Link>
          {isAuthenticated ? (
            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)} className="p-2">
                <div className="h-8 w-8 rounded-full gradient-bg flex items-center justify-center text-white font-medium text-sm">
                  {user.name?.[0]?.toUpperCase()}
                </div>
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 mt-2 w-56 glass rounded-xl p-2 shadow-xl"
                    onMouseLeave={() => setMenuOpen(false)}
                  >
                    <div className="px-3 py-2 border-b">
                      <p className="font-medium truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent" onClick={() => setMenuOpen(false)}>
                      <User className="h-4 w-4" /> Dashboard
                    </Link>
                    <Link to="/orders" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent" onClick={() => setMenuOpen(false)}>
                      <Package className="h-4 w-4" /> My Orders
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent" onClick={() => setMenuOpen(false)}>
                        Admin Panel
                      </Link>
                    )}
                    <button onClick={signOut} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-destructive/10 text-destructive">
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Button asChild size="sm" variant="gradient" className="hidden sm:inline-flex">
              <Link to="/login">Sign In</Link>
            </Button>
          )}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween' }}
            className="fixed inset-y-0 right-0 z-50 w-80 max-w-full bg-background border-l p-6 md:hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <Logo />
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <form onSubmit={handleSearch} className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full h-10 pl-10 pr-4 rounded-full border bg-background"
              />
            </form>
            <nav className="flex flex-col gap-2">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-lg ${isActive ? 'gradient-bg text-white' : 'hover:bg-accent'}`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
