import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Shield, AlertCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const SuperAdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      navigate('/superadmin');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      // Make the API request to validate credentials
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        }),
      });

      const data = await response.json();

      if (response.status === 200) {
        // Log the user data to see what we're getting from the backend
        console.log('Login response data:', data);
        console.log('User role from backend:', data.user?.role);
        
        // The backend might be returning a different role format
        // Accept any role that includes 'admin' (case insensitive)
        const userRole = data.user?.role?.toLowerCase() || '';
        const isAdmin = userRole.includes('admin') || userRole === 'super_admin';
        
        if (!isAdmin) {
          console.error('Role check failed:', userRole);
          throw new Error('Unauthorized: Only admin users can access this area');
        }

        // Login using the AuthContext
        const success = await login(data.access_token, data.refresh_token, data.user);
        
        if (success) {
          // Redirect to superadmin dashboard
          navigate('/superadmin');
        } else {
          throw new Error('Failed to update authentication context');
        }
      } else {
        throw new Error(data.error || data.message || 'Invalid email or password');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center py-12 px-4">
      <motion.div 
        className="max-w-md w-full bg-white rounded-xl shadow-sm overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Super Admin Portal</h1>
            <p className="text-gray-600">Access the administrative dashboard</p>
          </div>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#F2631F] focus:border-[#F2631F] outline-none transition-colors"
                placeholder="admin@example.com"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#F2631F] focus:border-[#F2631F] outline-none transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-2.5 px-4 rounded-md text-white font-medium ${
                  isSubmitting 
                    ? 'bg-[#F2631F]/70 cursor-not-allowed' 
                    : 'bg-[#F2631F] hover:bg-[#F2631F]/90 focus:outline-none focus:ring-2 focus:ring-[#F2631F] focus:ring-offset-2'
                } transition-colors`}
              >
                {isSubmitting ? 'Authenticating...' : 'Sign In'}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              This portal is restricted to authorized administrative personnel only.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SuperAdminLogin;
