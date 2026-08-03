import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ShopProvider } from './context/ShopContext.jsx';

/* ── Public pages ── */
import App from './App.jsx';
import Register from './Components/Register.jsx';
import Login from './Components/Login.jsx';
import ProductDetail from './Components/ProductDetail.jsx';
import Categories from './pages/Categories.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Orders from './pages/Orders.jsx';
import Account from './pages/Account.jsx';
import Wishlist from './pages/Wishlist.jsx';
import Products from './pages/Products.jsx';
import ScrollToTop from './Components/ScrollToTop.jsx';
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';
import TermsOfService from './pages/TermsOfService.jsx';
import CookiePolicy from './pages/CookiePolicy.jsx';
import NotFound from './pages/NotFound.jsx';

/* ── Admin ── */
import { AdminAuthProvider } from './admin/context/AdminAuthContext.jsx';
import AdminProtectedRoute from './admin/components/AdminProtectedRoute.jsx';
import AdminLayout from './admin/components/AdminLayout.jsx';
import AdminOverview from './admin/pages/AdminOverview.jsx';
import AdminOrders from './admin/pages/AdminOrders.jsx';
import AdminProducts from './admin/pages/AdminProducts.jsx';
import AdminCategories from './admin/pages/AdminCategories.jsx';
import AdminCustomers from './admin/pages/AdminCustomers.jsx';
import AdminAnalytics from './admin/pages/AdminAnalytics.jsx';
import AdminSettings from './admin/pages/AdminSettings.jsx';

import './index.css';

function Root() {
  // Restore user from localStorage on first load (persists across page refreshes)
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <ShopProvider>
          <ScrollToTop />
          <Routes>
            {/* ── Public routes ── */}
            <Route path="/"                    element={<App        user={user} onLogout={logout} />} />
            <Route path="/register"            element={<Register />} />
            <Route path="/login"               element={<Login onLogin={(u) => setUser(u)} />} />
            <Route path="/product/:product_id" element={<ProductDetail user={user} onLogout={logout} />} />
            <Route path="/categories"          element={<Categories user={user} onLogout={logout} />} />
            <Route path="/about"               element={<About      user={user} onLogout={logout} />} />
            <Route path="/contact"             element={<Contact    user={user} onLogout={logout} />} />
            <Route path="/cart"                element={<Cart       user={user} onLogout={logout} />} />
            <Route path="/checkout"            element={<Checkout   user={user} onLogout={logout} />} />
            <Route path="/orders"              element={<Orders     user={user} onLogout={logout} />} />
            <Route path="/account"             element={<Account    user={user} onLogout={logout} />} />
            <Route path="/wishlist"            element={<Wishlist   user={user} onLogout={logout} />} />
            <Route path="/products"            element={<Products   user={user} onLogout={logout} />} />
            <Route path="/privacy-policy"      element={<PrivacyPolicy   user={user} onLogout={logout} />} />
            <Route path="/terms-of-service"    element={<TermsOfService  user={user} onLogout={logout} />} />
            <Route path="/cookie-policy"       element={<CookiePolicy    user={user} onLogout={logout} />} />

            {/* ── Protected admin routes ── */}
            <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <AdminLayout />
                </AdminProtectedRoute>
              }
            >
              <Route index          element={<AdminOverview    />} />
              <Route path="orders"      element={<AdminOrders      />} />
              <Route path="products"    element={<AdminProducts    />} />
              <Route path="categories"  element={<AdminCategories  />} />
              <Route path="customers"   element={<AdminCustomers   />} />
              <Route path="analytics"   element={<AdminAnalytics   />} />
              <Route path="settings"    element={<AdminSettings    />} />
            </Route>

            <Route path="*" element={<NotFound user={user} onLogout={logout} />} />
          </Routes>
        </ShopProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
