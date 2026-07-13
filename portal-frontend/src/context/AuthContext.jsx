import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure global axios defaults for the portal
  axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  axios.defaults.withCredentials = true; // IMPORTANT: send http-only cookies

  useEffect(() => {
    // Check if user data exists in local storage
    const storedUser = localStorage.getItem('gwealth_user');
    const storedToken = localStorage.getItem('gwealth_token');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    
    // Global Axios Interceptor to catch 401 Unauthorized globally
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // Token expired or invalid - force logout silently
          setUser(null);
          localStorage.removeItem('gwealth_user');
          localStorage.removeItem('gwealth_token');
          delete axios.defaults.headers.common['Authorization'];
          if (window.location.pathname !== '/login' && window.location.pathname !== '/admin-login') {
             window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );

    setLoading(false);

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post('/api/auth/login', { email, password });
      
      setUser(data.data);
      localStorage.setItem('gwealth_user', JSON.stringify(data.data));
      localStorage.setItem('gwealth_token', data.token);
      // Store token in memory/axios defaults for Authorization header fallback
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      return { success: true, user: data.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const adminLogin = async (email, password) => {
    try {
      const { data } = await axios.post('/api/auth/admin-login', { email, password });
      
      setUser(data.data);
      localStorage.setItem('gwealth_user', JSON.stringify(data.data));
      localStorage.setItem('gwealth_token', data.token);
      // Store token in memory/axios defaults for Authorization header fallback
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      return { success: true, user: data.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Admin login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await axios.post('/api/auth/register', userData);
      return { success: true, message: data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout API failed, clearing local state anyway', error);
    } finally {
      setUser(null);
      localStorage.removeItem('gwealth_user');
      localStorage.removeItem('gwealth_token');
      // Remove auth header
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  const value = {
    user,
    loading,
    login,
    adminLogin,
    register,
    logout,
    isAdmin: user?.role === 'admin',
    isRealtor: user?.role === 'realtor'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
