import React, { useState, useEffect } from 'react';
import { Package, Search, ArrowRight, Truck, Calendar, MapPin } from 'lucide-react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

interface TrackingStep {
  status: string;
  location: string;
  timestamp: string;
  description: string;
}

interface TrackingInfo {
  orderId: string;
  status: 'Delivered' | 'In Transit' | 'Processing' | 'Out for Delivery';
  estimatedDelivery: string;
  currentLocation: string;
  steps: TrackingStep[];
}

const TrackOrder: React.FC = () => {
  const location = useLocation();
  const { orderId } = useParams();
  const [orderNumber, setOrderNumber] = useState('');
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for order ID in URL params first
    if (orderId) {
      setOrderNumber(orderId);
      handleTrackOrder(undefined, orderId);
    } 
    // If no URL param, check navigation state
    else {
      const state = location.state as { orderNumber?: string } | null;
      if (state?.orderNumber) {
        setOrderNumber(state.orderNumber);
        handleTrackOrder(undefined, state.orderNumber);
      }
    }
  }, [location.state, orderId]);

  // Mock tracking data - replace with actual API call
  const mockTrackingInfo: TrackingInfo = {
    orderId: '2468135790',
    status: 'In Transit',
    estimatedDelivery: 'November 15, 2024',
    currentLocation: 'Mumbai, Maharashtra',
    steps: [
      {
        status: 'Order Placed',
        location: 'Online',
        timestamp: 'Nov 10, 2024 09:30 AM',
        description: 'Your order has been placed successfully'
      },
      {
        status: 'Order Confirmed',
        location: 'Delhi, India',
        timestamp: 'Nov 10, 2024 10:15 AM',
        description: 'Seller has processed your order'
      },
      {
        status: 'Shipped',
        location: 'Delhi, India',
        timestamp: 'Nov 11, 2024 02:30 PM',
        description: 'Your order has been picked up by courier partner'
      },
      {
        status: 'In Transit',
        location: 'Mumbai, Maharashtra',
        timestamp: 'Nov 12, 2024 11:45 AM',
        description: 'Your order is on the way to the delivery address'
      }
    ]
  };

  const handleTrackOrder = (e?: React.FormEvent, prefilledOrderNumber?: string) => {
    if (e) {
      e.preventDefault();
    }
    setError(null);

    const orderNumberToTrack = prefilledOrderNumber || orderNumber;

    if (!orderNumberToTrack.trim()) {
      setError('Please enter an order number');
      return;
    }

    // Mock API call - replace with actual API integration
    if (orderNumberToTrack === mockTrackingInfo.orderId) {
      setTrackingInfo(mockTrackingInfo);
    } else {
      setError('Order not found. Please check the order number and try again.');
    }
  };

  const getStatusColor = (status: TrackingInfo['status']) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-500';
      case 'In Transit':
        return 'bg-[#FF4D00]';
      case 'Processing':
        return 'bg-yellow-500';
      case 'Out for Delivery':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Track Your Order</h1>
          <p className="text-gray-600">Enter your order number to track your package</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <form onSubmit={handleTrackOrder} className="flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Enter your order number"
                className="w-full px-4 py-3 pl-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4D00] focus:border-[#FF4D00]"
              />
              <Package className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-[#FF4D00] text-white rounded-lg hover:bg-[#FF4D00]/90 transition-colors flex items-center gap-2"
            >
              Track Order
            </button>
          </form>
          {error && (
            <p className="mt-4 text-red-500 text-sm">{error}</p>
          )}
        </div>

        {trackingInfo && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Package className="text-[#FF4D00]" size={24} />
                  <h3 className="font-medium">Order Status</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${getStatusColor(trackingInfo.status)}`}></span>
                  <span className="font-medium">{trackingInfo.status}</span>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="text-[#FF4D00]" size={24} />
                  <h3 className="font-medium">Estimated Delivery</h3>
                </div>
                <p>{trackingInfo.estimatedDelivery}</p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="text-[#FF4D00]" size={24} />
                  <h3 className="font-medium">Current Location</h3>
                </div>
                <p>{trackingInfo.currentLocation}</p>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-6">Tracking History</h3>
              <div className="space-y-8">
                {trackingInfo.steps.map((step, index) => (
                  <div key={index} className="relative flex gap-6">
                    <div className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full ${index === trackingInfo.steps.length - 1 ? 'bg-[#FF4D00]' : 'bg-green-500'}`}></div>
                      {index !== trackingInfo.steps.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-200 absolute top-4"></div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{step.status}</h4>
                        <span className="text-sm text-gray-500">• {step.location}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{step.description}</p>
                      <p className="text-sm text-gray-500">{step.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/orders')}
            className="text-[#FF4D00] hover:text-[#FF4D00]/80 transition-colors flex items-center gap-2 mx-auto"
          >
            View All Orders
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrackOrder; 