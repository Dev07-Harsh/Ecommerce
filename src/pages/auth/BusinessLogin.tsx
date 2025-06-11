import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const BusinessLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResend, setShowResend] = useState(false);

  // pull in both the login helper and the resend helper
  const { setAuthState, resendVerificationEmail } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setShowResend(false);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_email: email,
          password: password
        }),
      });

      const data = await response.json();

      if (response.status === 200) {
        // Successful login → hydrate context & redirect
        const success = await setAuthState({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          user: {
            id: data.user.id || 'unknown',
            email: data.user.email,
            name: data.user.first_name + ' ' + data.user.last_name,
            role: 'merchant',
            isEmailVerified: true,
            verificationStatus: data.user.verification_status,
            businessName: data.user.business_name
          }
        });

        if (success) {
          navigate('/business/dashboard');
        } else {
          throw new Error('Failed to initialize session');
        }

      } else {
        // Handle errors
        if (data.error_code === 'EMAIL_NOT_VERIFIED') {
          setError('Your business email is not verified.');
          setShowResend(true);
        } else {
          throw new Error(data.error || 'Invalid email or password');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      const ok = await resendVerificationEmail(email);
      if (ok) {
        setError('Verification email resent! Check your inbox.');
      } else {
        throw new Error('Unable to resend verification link');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error sending verification link');
    } finally {
      setIsSubmitting(false);
      setShowResend(false);
    }
  };

  return (
    <div className="bg-gray-50 flex items-center justify-center px-4 py-8">
      <motion.div 
        className="max-w-md w-full bg-white rounded-xl shadow-sm overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Business Account Login</h1>
            <p className="text-gray-600">Access your merchant dashboard</p>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {showResend && !isSubmitting && (
            <div
              className="mb-4 text-sm text-[#F2631F] cursor-pointer hover:underline"
              onClick={handleResend}
            >
              Didn’t get a verification email? Resend link.
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Business Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter your business email"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link to="/forgot-password" className="text-sm text-[#F2631F] hover:text-orange-400">
                  Forgot your password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>
            
            <div className="flex items-center">
              <input id="remember" type="checkbox" className="h-4 w-4 text-[#F2631F] focus:ring-[#F2631F] border-gray-300 rounded"/>
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#F2631F] text-white py-3 px-4 rounded-md font-medium hover:bg-orange-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Signing in...
                  </span>
                : 'Sign in to Business Account'
              }
            </button>
          </form>
        </div>
        
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            Don't have a business account?{' '}
            <Link to="/register-business" className="font-medium text-[#F2631F] hover:text-orange-400">
              Register your business
            </Link>
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Need a personal account?{' '}
            <Link to="/sign-in" className="font-medium text-[#F2631F] hover:text-orange-400">
              Sign in as customer
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default BusinessLogin;
