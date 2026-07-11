import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PortalLayout } from './components/layout/PortalLayout';
import './styles/design-system.css';

import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Register from './pages/Register';

import Dashboard from './pages/Dashboard';

import PropertyManager from './pages/PropertyManager';

import Partners from './pages/Partners';
import MediaHub from './pages/MediaHub';
import Excursions from './pages/Excursions';
import AssetVault from './pages/AssetVault';
import Messages from './pages/Messages';
import Subscribers from './pages/Subscribers';
import Visitors from './pages/Visitors';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes inside Layout */}
          <Route element={<PortalLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/properties" element={<PropertyManager />} />
            <Route path="/partners" element={<Partners />} />
            <Route path="/media" element={<MediaHub />} />
            <Route path="/excursions" element={<Excursions />} />
            <Route path="/assets-vault" element={<AssetVault />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/subscribers" element={<Subscribers />} />
            <Route path="/visitors" element={<Visitors />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
