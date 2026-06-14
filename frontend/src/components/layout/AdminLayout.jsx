import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Users, Tag, Star, Settings, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useEffect } from 'react';
import { Logo } from '../common/Logo.jsx';
import { ThemeToggle } from '../common/ThemeToggle.jsx';

const links = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/categories', icon: Tag, label: 'Categories' },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { to: '/admin/customers', icon: Users, label: 'Customers' },
  { to: '/admin/coupons', icon: Tag, label: 'Coupons' },
  { to: '/admin/reviews', icon: Star, label: 'Reviews' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

export const AdminLayout = () => {
  const { isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) navigate('/login');
  }, [isAdmin, navigate]);

  return (
    <div className="flex h-screen bg-muted/30">
      <aside className="w-64 border-r bg-card hidden lg:flex flex-col">
        <div className="p-4 border-b"><Logo /></div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${isActive ? 'gradient-bg text-white shadow' : 'hover:bg-accent'}`
              }
            >
              <l.icon className="h-4 w-4" /> {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t flex items-center justify-between">
          <button onClick={signOut} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4" /> Logout
          </button>
          <ThemeToggle />
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};
