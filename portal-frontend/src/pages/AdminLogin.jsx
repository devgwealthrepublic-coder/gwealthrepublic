import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLock, FiMail } from 'react-icons/fi';
import AuthCarousel from '../components/layout/AuthCarousel';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await adminLogin(email, password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Left side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-surface sm:bg-transparent">
        <div className="bg-white border border-trust-slate rounded-2xl shadow-xl w-full max-w-md p-10 overflow-hidden relative">
          
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-red-700"></div>

          <div className="text-center mb-10 mt-2">
            <h1 className="text-3xl font-headline-lg font-bold text-primary mb-2">Admin Portal</h1>
            <p className="text-on-surface-variant font-body-md">Secure access for GWealth Nation staff only</p>
          </div>

          {error && (
            <div className="bg-error-container text-error text-sm font-bold p-4 rounded-md mb-6 border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-label-md text-primary font-bold">Administrator Email</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                  <FiMail size={18} />
                </span>
                <input 
                  type="email" 
                  className="w-full pl-11 pr-4 py-3 border border-trust-slate rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all font-body-md text-gray-900 bg-white placeholder-gray-400" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@gwealthrepublic.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-label-md text-primary font-bold">Secure Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                  <FiLock size={18} />
                </span>
                <input 
                  type="password" 
                  className="w-full pl-11 pr-4 py-3 border border-trust-slate rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all font-body-md text-gray-900 bg-white placeholder-gray-400" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-primary text-white py-3.5 rounded-md font-bold text-body-lg hover:bg-primary-container transition-colors shadow-md mt-4 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Authenticating...
                </>
              ) : (
                'Secure Admin Login'
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center text-sm font-label-md">
            <a href="/login" className="text-primary hover:text-primary-container transition-colors font-bold">
              Return to Partner Login
            </a>
          </div>
        </div>
      </div>

      {/* Right side - Branding/Image */}
      <div className="hidden lg:block w-1/2">
        <AuthCarousel />
      </div>
    </div>
  );
};

export default AdminLogin;
