import React, { useState, useEffect } from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { Alert, CircularProgress, Snackbar } from '@mui/material';
import { toast } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface SubscriptionPlan {
  plan_id: number;
  name: string;
  description: string;
  featured_limit: number;
  promo_limit: number;
  duration_days: number;
  price: number;
  can_place_premium: boolean;
}

interface CurrentSubscription {
  is_subscribed: boolean;
  can_place_premium: boolean;
  subscription_started_at: string | null;
  subscription_expires_at: string | null;
  plan: SubscriptionPlan | null;
}

const Subscription: React.FC = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [subscribing, setSubscribing] = useState(false);

  // Fetch available subscription plans
  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Fetching subscription plans...');
      const response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/subscription/plans`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch plans: ${response.status}`);
      }

      const data = await response.json();
      console.log('Plans response:', data);
      setPlans(data);
    } catch (err) {
      console.error('Error fetching plans:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load subscription plans';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Fetch current subscription status
  const fetchCurrentSubscription = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Fetching current subscription...');
      const response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/subscription/current`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch subscription: ${response.status}`);
      }

      const data = await response.json();
      console.log('Current subscription response:', data);
      setCurrentSubscription(data);
    } catch (err) {
      console.error('Error fetching subscription:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load current subscription';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to a plan
  const handleSubscribe = async (planId: number) => {
    setSubscribing(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Subscribing to plan:', planId);
      const response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/subscription/subscribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ plan_id: planId })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to subscribe: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Subscribe response:', data);
      setCurrentSubscription(data.subscription);
      setSuccess('Successfully subscribed to plan');
      toast.success('Successfully subscribed to plan');
      await fetchCurrentSubscription(); // Refresh subscription status
    } catch (err) {
      console.error('Error subscribing:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to subscribe to plan';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubscribing(false);
    }
  };

  // Cancel subscription
  const handleCancel = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Cancelling subscription...');
      const response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/subscription/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to cancel: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Cancel response:', data);
      setCurrentSubscription(data.subscription);
      setSuccess('Successfully cancelled subscription');
      toast.success('Successfully cancelled subscription');
      await fetchCurrentSubscription(); // Refresh subscription status
    } catch (err) {
      console.error('Error cancelling:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel subscription';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Initial data fetch
  useEffect(() => {
    console.log('Initial data fetch started');
    console.log('API Base URL:', API_BASE_URL);
    fetchPlans();
    fetchCurrentSubscription();
  }, []);

  if (loading && !currentSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error && !currentSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold mb-2">Error Loading Subscription</p>
          <p>{error}</p>
          <button 
            onClick={() => {
              setError(null);
              fetchPlans();
              fetchCurrentSubscription();
            }}
            className="mt-4 px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Select the perfect plan to boost your business visibility and sales. All plans include our core features.
        </p>
      </div>

      {/* Current Subscription Status */}
      {currentSubscription?.is_subscribed && (
        <div className="mb-8 p-4 bg-green-50 rounded-lg">
          <h2 className="text-xl font-semibold text-green-800 mb-2">Current Subscription</h2>
          <p className="text-green-700">
            You are currently subscribed to the {currentSubscription.plan?.name} plan.
            {currentSubscription.subscription_expires_at && (
              <span> Expires on {new Date(currentSubscription.subscription_expires_at).toLocaleDateString()}</span>
            )}
          </p>
          <button
            onClick={handleCancel}
            className="mt-2 text-red-600 hover:text-red-800"
          >
            Cancel Subscription
          </button>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.plan_id}
            className={`relative rounded-2xl shadow-lg overflow-hidden ${
              plan.can_place_premium
                ? 'border-2 border-orange-500 transform scale-105'
                : 'border border-gray-200'
            }`}
          >
            {plan.can_place_premium && (
              <div className="absolute top-0 right-0 bg-orange-500 text-white px-4 py-1 text-sm font-medium rounded-bl-lg">
                Premium
              </div>
            )}
            
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                <span className="text-gray-600 ml-2">per {plan.duration_days} days</span>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <CheckIcon className="h-6 w-6 text-orange-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-600">{plan.description}</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="h-6 w-6 text-orange-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-600">{plan.featured_limit} featured products</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="h-6 w-6 text-orange-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-600">{plan.promo_limit} promotional products</span>
                </li>
                {plan.can_place_premium && (
                  <li className="flex items-start">
                    <CheckIcon className="h-6 w-6 text-orange-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-600">Premium product placement</span>
                  </li>
                )}
              </ul>
              
              <button
                onClick={() => handleSubscribe(plan.plan_id)}
                disabled={subscribing || (currentSubscription?.plan?.plan_id === plan.plan_id)}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                  plan.can_place_premium
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {subscribing ? 'Processing...' : 
                 currentSubscription?.plan?.plan_id === plan.plan_id ? 'Current Plan' : 
                 'Subscribe Now'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Error and Success Messages */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>

      {/* FAQ Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Can I change plans later?</h3>
            <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">What payment methods do you accept?</h3>
            <p className="text-gray-600">We accept all major credit cards, PayPal, and bank transfers for business accounts.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Is there a setup fee?</h3>
            <p className="text-gray-600">No, there are no setup fees. You only pay the subscription fee for your chosen plan.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Do you offer refunds?</h3>
            <p className="text-gray-600">Yes, we offer a 30-day money-back guarantee if you're not satisfied with our service.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription; 