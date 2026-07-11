import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePaystackPayment } from 'react-paystack';
import axios from 'axios';
import AuthCarousel from '../components/layout/AuthCarousel';

const subscriptionPlans = [
  { name: 'Superverse Subscription', amount: 53400 },
  { name: 'Metaverse Subscription', amount: 210000 },
  { name: 'Classic Subscription', amount: 380000 },
  { name: 'Silver Subscription', amount: 570000 },
  { name: 'Gold Subscription', amount: 760000 },
  { name: 'Emerald Subscription', amount: 1500000 },
  { name: 'Diamond Subscription', amount: 2280000 },
  { name: 'Premier Subscription', amount: 3820000 },
  { name: 'Premium Subscription', amount: 5360000 },
];

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    subscriptionPlan: 'Superverse Subscription'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const selectedPlan = subscriptionPlans.find(p => p.name === formData.subscriptionPlan);
  
  const config = {
      reference: (new Date()).getTime().toString(),
      email: formData.email,
      amount: selectedPlan.amount * 100, // Paystack amount is in kobo
      publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_your_key_here',
  };

  const initializePayment = usePaystackPayment(config);

  const onSuccess = async (reference) => {
    try {
      setLoading(true);
      await axios.post('/api/auth/verify-payment', {
        reference: reference.reference,
        email: formData.email,
        subscriptionPlan: selectedPlan.name,
        amountPaid: selectedPlan.amount
      });
      // Verification successful, cookie is set. Redirect to dashboard.
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.message || 'Payment verification failed');
      setLoading(false);
    }
  };

  const onClose = () => {
    setError('Payment window closed. Please try again.');
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const result = await register({
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      officeLocation: 'Online', 
    });
    
    if (result.success) {
      // Trigger Paystack payment
      initializePayment(onSuccess, onClose);
    } else {
      setError(result.message);
      setLoading(false);
    }
  };


  return (
    <main className="w-full h-screen overflow-hidden bg-surface font-body-md text-on-surface">
      <div className="grid grid-cols-1 md:grid-cols-2 w-full h-full">
        {/* Left Column: Form */}
        <div 
          className="flex flex-col items-center justify-center p-4 md:p-8 h-full overflow-y-auto" 
          style={{ 
            backgroundImage: 'radial-gradient(#27267d 0.5px, transparent 0.5px)', 
            backgroundSize: '24px 24px', 
            backgroundColor: '#FAFAFA', 
            opacity: 0.95 
          }}
        >
          <div className="w-full max-w-md my-auto">
            <div className="mb-6">
              <h1 className="font-headline-md text-[24px] md:text-headline-md text-primary mb-1">Create Your Account</h1>
              <p className="text-on-surface-variant text-[14px] md:text-body-md">Begin your journey to secure property ownership.</p>
            </div>
            
            {error && (
              <div className="bg-error-container border border-error text-on-error-container px-4 py-3 rounded mb-4 text-label-md">
                {error}
              </div>
            )}

            <form className="space-y-4 md:space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-3">
                <div className="relative">
                  <label className="block text-label-md text-primary font-bold mb-1">Full Name</label>
                  <input 
                    className="w-full px-3 py-2 md:px-4 md:py-3 border border-trust-slate auth-radius focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white text-gray-900 placeholder-gray-400" 
                    placeholder="John Doe" 
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="relative">
                    <label className="block text-label-md text-primary font-bold mb-1">Email Address</label>
                    <input 
                      className="w-full px-3 py-2 md:px-4 md:py-3 border border-trust-slate auth-radius focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white text-gray-900 placeholder-gray-400" 
                      placeholder="john@example.com" 
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-label-md text-primary font-bold mb-1">Phone Number</label>
                    <input 
                      className="w-full px-3 py-2 md:px-4 md:py-3 border border-trust-slate auth-radius focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white text-gray-900 placeholder-gray-400" 
                      placeholder="+234..." 
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="relative">
                  <label className="block text-label-md text-primary font-bold mb-1">Subscription Plan</label>
                  <select 
                    className="w-full px-3 py-2 md:px-4 md:py-3 border border-trust-slate auth-radius focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white text-gray-900"
                    name="subscriptionPlan"
                    value={formData.subscriptionPlan}
                    onChange={handleChange}
                  >
                    {subscriptionPlans.map((plan) => (
                      <option key={plan.name} value={plan.name}>
                        {plan.name} - ₦{plan.amount.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="relative">
                    <label className="block text-label-md text-primary font-bold mb-1">Password</label>
                    <input 
                      className="w-full px-3 py-2 md:px-4 md:py-3 border border-trust-slate auth-radius focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white text-gray-900 placeholder-gray-400" 
                      placeholder="••••••••" 
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-label-md text-primary font-bold mb-1">Confirm Password</label>
                    <input 
                      className="w-full px-3 py-2 md:px-4 md:py-3 border border-trust-slate auth-radius focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white text-gray-900 placeholder-gray-400" 
                      placeholder="••••••••" 
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 py-1">
                <input className="mt-1 w-5 h-5 border-trust-slate text-primary auth-radius focus:ring-primary" id="terms" type="checkbox" required />
                <label className="text-[13px] md:text-label-md text-on-surface-variant leading-tight" htmlFor="terms">
                  I agree to GWealth Nation's <a className="text-primary font-bold hover:underline" href="/terms-of-service/" target="_blank" rel="noopener noreferrer">Terms of Service</a> and <a className="text-primary font-bold hover:underline" href="/privacy-policy/" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
                </label>
              </div>
              <button 
                className="w-full bg-primary text-on-primary py-3 md:py-4 auth-radius font-bold text-[16px] md:text-body-lg hover:bg-primary-container shadow-md transition-all duration-200 flex items-center justify-center gap-2" 
                type="submit"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Proceed to Payment'}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              <div className="text-center pt-2">
                <div className="text-label-md">
                  <Link className="text-primary font-bold hover:underline" to="/login">Already a partner? Sign in here</Link>
                </div>
              </div>
            </form>
          </div>
        </div>
        
        {/* Right Column: Animated Carousel */}
        <AuthCarousel />
      </div>
    </main>
  );
};

export default Register;
