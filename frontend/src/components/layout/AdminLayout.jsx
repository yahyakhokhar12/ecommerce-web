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
  { to: '/admin/users', icon: Users, label: 'Users' },
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
    <div className="flex min-h-screen bg-[#070b14] text-slate-100">
      <aside className="hidden w-64 flex-col border-r border-white/10 bg-[#0b1220] lg:flex">
        <div className="border-b border-white/10 p-4"><Logo /></div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${isActive ? 'bg-white text-slate-950 shadow-lg shadow-black/20' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`
              }
            >
              <l.icon className="h-4 w-4" /> {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center justify-between border-t border-white/10 p-4">
          <button onClick={signOut} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white">
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
