import React from 'react';

const OrderConfirmationPage = () => {
  const handleNavigateToProfile = () => {
    // Handle navigation to profile
    console.log('Navigate to profile');
  };

  const handleViewOrder = () => {
    // Handle navigation to orders
    console.log('Navigate to orders');
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Success Icon */}
        <div className="mx-auto w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-5">
          <svg 
            className="w-7 h-7 text-green-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
        </div>

        {/* Confirmation Message */}
        <div className="mb-6">
          <h2 className="text-xl font-medium text-gray-900 mb-2">
            Your order is successfully placed
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            We'll keep you updated every step of the way until it reaches you.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleNavigateToProfile}
            className="px-6 py-2.5 border border-black rounded-lg text-sm font-medium text-black bg-white hover:bg-gray-50 transition-colors"
          >
            GO TO PROFILE
          </button>
          <button
            onClick={handleViewOrder}
            className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 transition-colors"
          >
            View Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;