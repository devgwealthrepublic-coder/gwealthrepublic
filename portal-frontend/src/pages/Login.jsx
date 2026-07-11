import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <main className="h-screen w-full overflow-hidden grid md:grid-cols-2 font-body-md text-on-surface bg-surface">
      {/* Left Side: Login Form */}
      <div 
        className="flex items-center justify-center p-8 bg-surface h-full" 
        style={{ 
          backgroundImage: 'radial-gradient(#27267d 0.5px, transparent 0.5px)', 
          backgroundSize: '24px 24px', 
          backgroundColor: '#FAFAFA', 
          opacity: 0.8 
        }}
      >
        <div className="w-full max-w-md">
          <div className="bg-white border border-trust-slate p-8 auth-card rounded">
            <div className="mb-8 text-center">
              <h1 className="font-headline-md text-headline-md text-legal-ink mb-2">Secure Sign In</h1>
              <p className="text-on-surface-variant font-body-md">Access your verified property portfolio</p>
            </div>
            
            {error && (
              <div className="bg-error-container border border-error text-on-error-container px-4 py-3 rounded mb-6 text-label-md text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6" id="signin-form">
              <div className="space-y-2">
                <label className="block font-label-md text-on-surface" htmlFor="email">Email Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">mail</span>
                  <input 
                    className="w-full pl-10 pr-4 py-3 bg-white border border-trust-slate rounded focus:outline-none focus:border-primary transition-colors font-body-md text-gray-900 placeholder-gray-400" 
                    id="email" 
                    name="email" 
                    placeholder="name@example.com" 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block font-label-md text-on-surface" htmlFor="password">Password</label>
                  <a className="text-primary font-label-sm hover:underline" href="#">Forgot Password?</a>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">lock</span>
                  <input 
                    className="w-full pl-10 pr-12 py-3 bg-white border border-trust-slate rounded focus:outline-none focus:border-primary transition-colors font-body-md text-gray-900 placeholder-gray-400" 
                    id="password" 
                    name="password" 
                    placeholder="••••••••" 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary" 
                    onClick={() => setShowPassword(!showPassword)} 
                    type="button"
                  >
                    <span className="material-symbols-outlined" id="password-toggle-icon">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <button 
                className="w-full bg-primary-container text-white py-4 rounded font-bold text-lg hover:bg-primary transition-all duration-200 flex items-center justify-center gap-2" 
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                    Sign In
                  </>
                )}
              </button>

              <div className="text-center mt-4">
                <Link className="text-primary font-label-md hover:underline" to="/register">Are you a new partner? Apply here</Link>
              </div>
            </form>

            {/* Removed the "Don't have an account? Sign Up" text block as requested */}
          </div>
        </div>
      </div>

      {/* Right Side: Image */}
      <div className="hidden md:flex relative overflow-hidden bg-white items-center justify-center h-full">
        <img alt="GWealth Nation Logo" className="w-[80%] max-w-[800px] object-contain" src="/gwealth-logo3.0.png" />
      </div>
    </main>
  );
};

export default Login;
