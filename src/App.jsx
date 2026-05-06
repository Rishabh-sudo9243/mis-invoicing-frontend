import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login          from './pages/Login';
import Register       from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword  from './pages/ResetPassword';
import Dashboard      from './pages/Dashboard';
import Clients        from './pages/Clients';
import Estimates      from './pages/Estimates';
import Invoices       from './pages/Invoices';
import Payments       from './pages/Payments';
import Groups         from './pages/Groups';
import Brands from './pages/Brands';
import Chains from './pages/Chains';
import Zones from "./components/Zones";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login"           element={<Login />} />
          <Route path="/register"        element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password"  element={<ResetPassword />} />

          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="clients"   element={<Clients />} />
            <Route path="estimates" element={<Estimates />} />
            <Route path="invoices"  element={<Invoices />} />
            <Route path="payments"  element={<Payments />} />
            <Route path="groups"    element={<Groups />} />
            <Route path="/chains" element={<Chains />} />
            <Route path="/brands" element={<Brands />} />
            <Route path="/zones" element={<Zones />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
