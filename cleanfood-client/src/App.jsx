import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Dashboard from './pages/Dashboard';
import ProductManagement from './pages/ProductManagement';
import CategoryManagement from './pages/CategoryManagement';
import OrderManagement from './pages/OrderManagement';
import UserManagement from './pages/UserManagement';
import AdminLayout from './components/layout/AdminLayout';
import UserLayout from './components/layout/UserLayout';
import HomePage from './pages/HomePage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import PaymentResultPage from './pages/PaymentResultPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import ProfilePage from './pages/ProfilePage';
import useAuth from './stores/useAuth';

// Admin Protected Route
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user?.role !== 'ROLE_ADMIN') return <Navigate to="/" />;
  
  return <AdminLayout>{children}</AdminLayout>;
};

// Customer Layout Wrapper
const CustomerRoute = ({ children }) => {
  return <UserLayout>{children}</UserLayout>;
};

function App() {
  return (
    <Router>
      <Toaster position="top-center" toastOptions={{ 
        style: { borderRadius: '16px', fontWeight: 'bold', fontSize: '14px' },
        success: { iconTheme: { primary: '#059669', secondary: '#fff' } }
      }} />
      <Routes>
        {/* Public Routes with UserLayout */}
        <Route path="/" element={<CustomerRoute><HomePage /></CustomerRoute>} />
        <Route path="/products" element={<CustomerRoute><ProductListPage /></CustomerRoute>} />
        <Route path="/products/:id" element={<CustomerRoute><ProductDetailPage /></CustomerRoute>} />
        <Route path="/cart" element={<CustomerRoute><CartPage /></CustomerRoute>} />
        <Route path="/payment-result" element={<CustomerRoute><PaymentResultPage /></CustomerRoute>} />
        <Route path="/my-orders" element={<CustomerRoute><OrderHistoryPage /></CustomerRoute>} />
        <Route path="/profile" element={<CustomerRoute><ProfilePage /></CustomerRoute>} />

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        {/* Admin Protected Routes */}
        <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/admin/categories" element={<ProtectedRoute><CategoryManagement /></ProtectedRoute>} />
        <Route path="/admin/products" element={<ProtectedRoute><ProductManagement /></ProtectedRoute>} />
        <Route path="/admin/orders" element={<ProtectedRoute><OrderManagement /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />

        {/* Redirects */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
