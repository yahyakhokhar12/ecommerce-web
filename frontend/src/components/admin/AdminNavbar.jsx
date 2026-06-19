import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Menu,
  X,
  LogOut,
  Settings,
  Bell,
  Search,
  Moon,
  Sun,
} from 'lucide-react';
import { logout } from '../../features/auth/authSlice';

const AdminNavbar = ({ toggleSidebar, sidebarOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [theme, setTheme] = React.useState('light');
  const [notificationOpen, setNotificationOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark');
  };

  return (
    <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Side - Menu & Search */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg lg:hidden"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-2">
              <Search size={18} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent outline-none ml-2 text-sm w-40 dark:text-white"
              />
            </div>
          </div>

          {/* Right Side - Icons & Profile */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg relative"
              >
                <Bell size={20} />
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </button>

              {notificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50">
                  <div className="p-4 border-b dark:border-slate-700">
                    <h3 className="font-semibold">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <div className="p-4 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer">
                      <p className="text-sm font-medium">New order placed</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Order #12345</p>
                    </div>
                    <div className="p-4 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer">
                      <p className="text-sm font-medium">Low stock alert</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Product: Laptop</p>
                    </div>
                    <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer">
                      <p className="text-sm font-medium">Payment received</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">$599.99 from stripe</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                <img
                  src={user?.avatar || 'https://via.placeholder.com/32'}
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                    {user?.role}
                  </p>
                </div>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50">
                  <div className="p-3 border-b dark:border-slate-700">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {user?.email}
                    </p>
                  </div>
                  <div className="p-2">
                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded flex items-center gap-2">
                      <Settings size={16} />
                      Profile Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 rounded flex items-center gap-2 text-red-600"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
