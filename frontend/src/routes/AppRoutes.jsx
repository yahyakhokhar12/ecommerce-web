import { Routes, Route } from 'react-router-dom';
import { Home } from '../pages/Home.jsx';
import { Products } from '../pages/Products.jsx';
import { ProductDetails } from '../pages/ProductDetails.jsx';
import { About } from '../pages/About.jsx';
import { Contact } from '../pages/Contact.jsx';
import { Login } from '../pages/Login.jsx';
import { Register } from '../pages/Register.jsx';
import { ForgotPassword } from '../pages/ForgotPassword.jsx';
import { ResetPassword } from '../pages/ResetPassword.jsx';
import { Cart } from '../pages/user/Cart.jsx';
import { Wishlist } from '../pages/user/Wishlist.jsx';
import { Checkout } from '../pages/user/Checkout.jsx';
import { Orders } from '../pages/user/Orders.jsx';
import { Dashboard } from '../pages/user/Dashboard.jsx';
import { Profile } from '../pages/user/Profile.jsx';
import { OrderSuccess } from '../pages/user/OrderSuccess.jsx';
import { AdminLayout } from '../components/layout/AdminLayout.jsx';
import { AdminDashboard } from '../pages/admin/Dashboard.jsx';
import { Analytics } from '../pages/admin/Analytics.jsx';
import { AdminProducts } from '../pages/admin/Products.jsx';
import { AdminOrders } from '../pages/admin/Orders.jsx';
import AdminUsers from '../pages/admin/Users.jsx';
import AdminCategories from '../pages/admin/Categories.jsx';
import AdminCoupons from '../pages/admin/Coupons.jsx';
import AdminReviews from '../pages/admin/Reviews.jsx';
import AdminPayments from '../pages/admin/Payments.jsx';
import AdminInventory from '../pages/admin/Inventory.jsx';
import AdminSettings from '../pages/admin/Settings.jsx';
import AdminReports from '../pages/admin/Reports.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';
import { AdminRoute } from './AdminRoute.jsx';
import { Header } from '../components/layout/Header.jsx';
import { Footer } from '../components/layout/Footer.jsx';
import { NotFound } from '../pages/NotFound.jsx';

export const AppRoutes = () => (
  <>
    <Header />
    <main className="min-h-[calc(100vh-4rem)]">
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
    </main>
    <Footer />
  </>
);
