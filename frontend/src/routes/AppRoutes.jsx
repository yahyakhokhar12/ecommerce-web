import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AdminLayout } from '../components/layout/AdminLayout.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';
import { AdminRoute } from './AdminRoute.jsx';
import { Header } from '../components/layout/Header.jsx';
import { Footer } from '../components/layout/Footer.jsx';
import { Skeleton } from '../components/ui/skeleton.jsx';

const Home = lazy(() => import('../pages/Home.jsx').then((m) => ({ default: m.Home })));
const Products = lazy(() => import('../pages/Products.jsx').then((m) => ({ default: m.Products })));
const ProductDetails = lazy(() => import('../pages/ProductDetails.jsx').then((m) => ({ default: m.ProductDetails })));
const About = lazy(() => import('../pages/About.jsx').then((m) => ({ default: m.About })));
const Contact = lazy(() => import('../pages/Contact.jsx').then((m) => ({ default: m.Contact })));
const Login = lazy(() => import('../pages/Login.jsx').then((m) => ({ default: m.Login })));
const Register = lazy(() => import('../pages/Register.jsx').then((m) => ({ default: m.Register })));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword.jsx').then((m) => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import('../pages/ResetPassword.jsx').then((m) => ({ default: m.ResetPassword })));
const OAuthCallback = lazy(() => import('../pages/OAuthCallback.jsx').then((m) => ({ default: m.OAuthCallback })));
const InfoPage = lazy(() => import('../pages/InfoPage.jsx').then((m) => ({ default: m.InfoPage })));
const Cart = lazy(() => import('../pages/user/Cart.jsx').then((m) => ({ default: m.Cart })));
const Wishlist = lazy(() => import('../pages/user/Wishlist.jsx').then((m) => ({ default: m.Wishlist })));
const Checkout = lazy(() => import('../pages/user/Checkout.jsx').then((m) => ({ default: m.Checkout })));
const Orders = lazy(() => import('../pages/user/Orders.jsx').then((m) => ({ default: m.Orders })));
const Dashboard = lazy(() => import('../pages/user/Dashboard.jsx').then((m) => ({ default: m.Dashboard })));
const Profile = lazy(() => import('../pages/user/Profile.jsx').then((m) => ({ default: m.Profile })));
const OrderSuccess = lazy(() => import('../pages/user/OrderSuccess.jsx').then((m) => ({ default: m.OrderSuccess })));
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard.jsx').then((m) => ({ default: m.AdminDashboard })));
const Analytics = lazy(() => import('../pages/admin/Analytics.jsx').then((m) => ({ default: m.Analytics })));
const AdminProducts = lazy(() => import('../pages/admin/Products.jsx').then((m) => ({ default: m.AdminProducts })));
const AdminOrders = lazy(() => import('../pages/admin/Orders.jsx').then((m) => ({ default: m.AdminOrders })));
const AdminUsers = lazy(() => import('../pages/admin/Users.jsx'));
const AdminCategories = lazy(() => import('../pages/admin/Categories.jsx'));
const AdminCoupons = lazy(() => import('../pages/admin/Coupons.jsx'));
const AdminReviews = lazy(() => import('../pages/admin/Reviews.jsx'));
const AdminPayments = lazy(() => import('../pages/admin/Payments.jsx'));
const AdminInventory = lazy(() => import('../pages/admin/Inventory.jsx'));
const AdminSettings = lazy(() => import('../pages/admin/Settings.jsx'));
const AdminReports = lazy(() => import('../pages/admin/Reports.jsx'));
const NotFound = lazy(() => import('../pages/NotFound.jsx').then((m) => ({ default: m.NotFound })));

const RouteFallback = () => (
  <div className="container grid gap-4 py-8">
    <Skeleton className="h-10 w-56" />
    <Skeleton className="h-64 w-full rounded-2xl" />
  </div>
);

export const AppRoutes = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
  <>
    {!isAdmin && <Header />}
    <main className="min-h-[calc(100vh-4rem)]">
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />
          <Route path="/help-center" element={<InfoPage />} />
          <Route path="/returns" element={<InfoPage />} />
          <Route path="/shipping" element={<InfoPage />} />
          <Route path="/careers" element={<InfoPage />} />
          <Route path="/blog" element={<InfoPage />} />
          <Route path="/press" element={<InfoPage />} />
          <Route path="/cart" element={<Cart />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/order-success/:id" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />

        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="reports" element={<AdminReports />} />
        </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </main>
    {!isAdmin && <Footer />}
  </>
  );
};
