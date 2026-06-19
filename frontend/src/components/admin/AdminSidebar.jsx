import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  Layers,
  Tag,
  MessageSquare,
  TrendingUp,
  Archive,
  X,
} from 'lucide-react';

const AdminSidebar = ({ isOpen, onClose }) => {
  const menuItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin/dashboard',
    },
    {
      label: 'Products',
      icon: Package,
      path: '/admin/products',
    },
    {
      label: 'Categories',
      icon: Layers,
      path: '/admin/categories',
    },
    {
      label: 'Orders',
      icon: ShoppingCart,
      path: '/admin/orders',
    },
    {
      label: 'Payments',
      icon: CreditCard,
      path: '/admin/payments',
    },
    {
      label: 'Users',
      icon: Users,
      path: '/admin/users',
    },
    {
      label: 'Reviews',
      icon: MessageSquare,
      path: '/admin/reviews',
    },
    {
      label: 'Coupons',
      icon: Tag,
      path: '/admin/coupons',
    },
    {
      label: 'Inventory',
      icon: Archive,
      path: '/admin/inventory',
    },
    {
      label: 'Analytics',
      icon: TrendingUp,
      path: '/admin/analytics',
    },
    {
      label: 'Reports',
      icon: BarChart3,
      path: '/admin/reports',
    },
    {
      label: 'Settings',
      icon: Settings,
      path: '/admin/settings',
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static left-0 top-0 pt-16 lg:pt-0 h-screen lg:h-[calc(100vh-64px)] 
          bg-slate-900 dark:bg-slate-950 text-white
          w-64 transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
          overflow-y-auto z-40 lg:z-0
        `}
      >
        <div className="p-4 flex justify-between items-center lg:hidden">
          <h2 className="font-bold text-lg">Menu</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded">
            <X size={20} />
          </button>
        </div>

        <nav className="px-3 py-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`
              }
            >
              <item.icon size={20} />
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Quick Stats */}
        <div className="px-3 py-6 border-t border-slate-800">
          <p className="text-xs text-slate-400 px-4 mb-3">QUICK STATS</p>
          <div className="space-y-3">
            <div className="px-4 py-2 bg-slate-800 rounded-lg">
              <p className="text-xs text-slate-400">Total Revenue</p>
              <p className="text-lg font-bold">$24,580</p>
            </div>
            <div className="px-4 py-2 bg-slate-800 rounded-lg">
              <p className="text-xs text-slate-400">Total Orders</p>
              <p className="text-lg font-bold">342</p>
            </div>
            <div className="px-4 py-2 bg-slate-800 rounded-lg">
              <p className="text-xs text-slate-400">New Users</p>
              <p className="text-lg font-bold">89</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
