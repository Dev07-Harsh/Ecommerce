import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, RotateCcw, Star, FileText, ChevronDown, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  price: string;
  image_url: string;
}

interface Order {
  id: string;
  order_id: string;
  order_number: string;
  order_status: string;
  payment_status: string;
  total_amount: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  shipping_address: {
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  currency: string;
  status: 'Delivered' | 'In Transit' | 'Processing' | 'Cancelled';
  deliveryDate: string;
  orderDate: string;
  productName: string;
  imageUrl: string;
  price: number;
  canReturn: boolean;
  canExchange: boolean;
  canReview: boolean;
  trackingNumber?: string;
}

interface ApiResponse {
  status: string;
  data: {
    orders: Order[];
    pagination?: {
      total: number;
      current_page: number;
      per_page: number;
      pages: number;
    };
  };
  message?: string;
}

const Order: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(10);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Mock initial data
  const mockOrders: Order[] = [
    {
      id: '2468135790',
      order_id: '2468135790',
      order_number: '2468135790',
      order_status: 'Delivered',
      payment_status: 'Paid',
      total_amount: '129.99',
      created_at: '2024-11-07',
      updated_at: '2024-11-12',
      items: [{
        id: 1,
        product_name: "Women's Fashion Dress",
        quantity: 1,
        price: '129.99',
        image_url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105'
      }],
      shipping_address: {
        address_line1: '123 Fashion St',
        city: 'Fashion City',
        state: 'FC',
        postal_code: '12345',
        country: 'USA'
      },
      currency: 'USD',
      status: 'Delivered',
      deliveryDate: 'Nov 12, 2024',
      orderDate: 'Nov 7, 2024',
      productName: "Women's Fashion Dress",
      imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105',
      price: 129.99,
      canReturn: true,
      canExchange: true,
      canReview: true,
      trackingNumber: 'TN123456789'
    },
    {
      id: '1357924680',
      order_id: '1357924680',
      order_number: '1357924680',
      order_status: 'In Transit',
      payment_status: 'Paid',
      total_amount: '299.99',
      created_at: '2024-11-10',
      updated_at: '2024-11-10',
      items: [{
        id: 2,
        product_name: "Men's Premium Watch",
        quantity: 1,
        price: '299.99',
        image_url: 'https://images.unsplash.com/photo-1617137968427-85924c800a22'
      }],
      shipping_address: {
        address_line1: '456 Watch Ave',
        city: 'Watch City',
        state: 'WC',
        postal_code: '67890',
        country: 'USA'
      },
      currency: 'USD',
      status: 'In Transit',
      deliveryDate: 'Expected Nov 15, 2024',
      orderDate: 'Nov 10, 2024',
      productName: "Men's Premium Watch",
      imageUrl: 'https://images.unsplash.com/photo-1617137968427-85924c800a22',
      price: 299.99,
      canReturn: false,
      canExchange: false,
      canReview: false,
      trackingNumber: 'TN987654321'
    }
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/sign-in');
      return;
    }
    // Initialize with mock data for development
    setOrders(mockOrders);
    setLoading(false);
    // In production, you would call fetchOrders() here instead
  }, [isAuthenticated, navigate]);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-500';
      case 'In Transit':
        return 'bg-blue-500';
      case 'Processing':
        return 'bg-yellow-500';
      case 'Cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleOrderClick = (order: Order) => {
    navigate(`/order/${order.id}`, { state: { order } });
  };

  const handleAction = (e: React.MouseEvent, type: string, order: Order) => {
    e.stopPropagation();
    switch (type) {
      case 'exchange':
        navigate(`/exchange/${order.id}`, { state: { order } });
        break;
      case 'return':
        navigate(`/refund/${order.id}`, { state: { order } });
        break;
      case 'review':
        navigate(`/review/${order.id}`, { state: { order } });
        break;
      case 'track':
        navigate(`/track/${order.id}`, { state: { order } });
        break;
    }
  };

  const filteredOrders = orders.filter(order => 
    (selectedFilter === 'all' || order.status.toLowerCase() === selectedFilter) &&
    (order.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
     order.id.includes(searchQuery))
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold mb-2">Error Loading Orders</p>
          <p>{error}</p>
          <button 
            onClick={() => setError(null)}
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Your Orders</h1>
        <div className="flex flex-wrap gap-2 sm:gap-4">
          <button 
            className="px-4 py-2 text-[#FF4D00] border border-[#FF4D00] rounded-lg hover:bg-[#FF4D00] hover:text-white transition-colors text-sm sm:text-base"
            onClick={() => navigate('/return-refund')}
          >
            Returns Policy
          </button>
        </div>
      </div>
      
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search orders by product name or order ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4D00] text-sm sm:text-base"
          />
        </div>
        <div className="relative">
          <button 
            className="w-full sm:w-auto px-4 py-2 border rounded-lg flex items-center justify-center gap-2 hover:border-[#FF4D00] transition-colors text-sm sm:text-base"
            onClick={() => setFilterOpen(!filterOpen)}
          >
            <Filter size={20} />
            Filter
            <ChevronDown size={16} />
          </button>
          {filterOpen && (
            <div className="absolute right-0 mt-2 w-full sm:w-48 bg-white border rounded-lg shadow-lg z-10">
              <div className="p-2">
                {['all', 'delivered', 'in transit', 'processing', 'cancelled'].map((filter) => (
                  <button 
                    key={filter}
                    className={`w-full text-left px-3 py-2 rounded capitalize text-sm sm:text-base ${
                      selectedFilter === filter ? 'bg-[#FF4D00] text-white' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      setSelectedFilter(filter);
                      setFilterOpen(false);
                    }}
                  >
                    {filter === 'all' ? 'All Orders' : filter}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No orders found</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => handleOrderClick(order)}
              className="border rounded-lg p-4 sm:p-6 space-y-4 cursor-pointer hover:border-[#FF4D00] transition-colors bg-white shadow-sm"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  <img
                    src={order.imageUrl}
                    alt={order.productName}
                    className="w-full sm:w-24 h-24 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="font-medium text-base sm:text-lg mb-1">{order.productName}</h3>
                    <p className="text-gray-600 text-xs sm:text-sm mb-1">Order #{order.order_number}</p>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${getStatusColor(order.status)}`}></span>
                      <span className="font-medium text-sm sm:text-base">{order.status}</span>
                    </div>
                    <p className="text-gray-600 text-xs sm:text-sm mt-1">
                      {order.status === 'Delivered' ? `Delivered on ${order.deliveryDate}` : order.deliveryDate}
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto">
                  <p className="font-semibold text-base sm:text-lg">${order.price.toFixed(2)}</p>
                  <p className="text-gray-600 text-xs sm:text-sm">Ordered on {formatDate(order.created_at)}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t">
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {order.canReturn && (
                    <button
                      onClick={(e) => handleAction(e, 'return', order)}
                      className="px-3 sm:px-4 py-2 text-[#FF4D00] border border-[#FF4D00] rounded-lg hover:bg-[#FF4D00] hover:text-white transition-colors flex items-center gap-2 text-sm"
                    >
                      <RotateCcw size={16} />
                      Return
                    </button>
                  )}
                  {order.canExchange && (
                    <button
                      onClick={(e) => handleAction(e, 'exchange', order)}
                      className="px-3 sm:px-4 py-2 text-[#FF4D00] border border-[#FF4D00] rounded-lg hover:bg-[#FF4D00] hover:text-white transition-colors flex items-center gap-2 text-sm"
                    >
                      <Package size={16} />
                      Exchange
                    </button>
                  )}
                  {order.canReview && (
                    <button
                      onClick={(e) => handleAction(e, 'review', order)}
                      className="px-3 sm:px-4 py-2 text-[#FF4D00] border border-[#FF4D00] rounded-lg hover:bg-[#FF4D00] hover:text-white transition-colors flex items-center gap-2 text-sm"
                    >
                      <Star size={16} />
                      Review
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
                  <button
                    onClick={(e) => handleAction(e, 'track', order)}
                    className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-[#FF4D00] text-white rounded-lg hover:bg-[#FF4D00]/90 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    Track Order
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle invoice download
                    }}
                    className="w-full sm:w-auto px-3 sm:px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <FileText size={16} />
                    Invoice
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-1 my-6">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="w-8 h-8 flex items-center justify-center border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#FF4D00]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-8 h-8 flex items-center justify-center border rounded-lg text-sm sm:text-base ${
                currentPage === i + 1
                  ? 'bg-[#FF4D00] text-white'
                  : 'hover:border-[#FF4D00]'
              }`}
            >
              {i + 1}
            </button>
          ))}
          
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="w-8 h-8 flex items-center justify-center border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#FF4D00]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Order; 