import React, { useState, useEffect } from 'react';
import { 
  FunnelIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  EyeIcon,
  PencilIcon,
  PrinterIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Define interfaces for type safety
interface Address {
  address_id: number;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  address_type: string;
}

interface OrderItem {
  item_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  merchant_id: number;
}

interface Order {
  order_id: string;
  order_date: string;
  created_at: string;
  updated_at: string;
  user_id: number;
  shipping_address_id: number;
  shipping_address_details: Address;
  billing_address_id: number | null;
  billing_address_details: Address | null;
  items: OrderItem[];
  subtotal_amount: string;
  tax_amount: string;
  shipping_amount: string;
  discount_amount: string;
  total_amount: string;
  currency: string;
  order_status: string;
  payment_status: string;
  payment_method: string | null;
  payment_gateway_transaction_id: string | null;
  shipping_method_name: string;
  customer_notes: string;
  status_history: any[];
}

interface PaginationInfo {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

interface ApiResponse {
  orders: Order[];
  pagination: PaginationInfo;
}

// Status options
const STATUS_OPTIONS = [
  'All',
  'PENDING_PAYMENT',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

// Payment status options
const PAYMENT_OPTIONS = [
  'All',
  'PENDING',
  'SUCCESSFUL',
  'FAILED',
  'REFUNDED',
];

// Status badge component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let bgColor = '';
  let textColor = '';
  
  switch (status) {
    case 'DELIVERED':
      bgColor = 'bg-emerald-100';
      textColor = 'text-emerald-800';
      break;
    case 'SHIPPED':
      bgColor = 'bg-sky-100';
      textColor = 'text-sky-800';
      break;
    case 'PROCESSING':
      bgColor = 'bg-amber-100';
      textColor = 'text-amber-800';
      break;
    case 'PENDING_PAYMENT':
      bgColor = 'bg-orange-100';
      textColor = 'text-orange-800';
      break;
    case 'CANCELLED':
      bgColor = 'bg-rose-100';
      textColor = 'text-rose-800';
      break;
    case 'SUCCESSFUL':
      bgColor = 'bg-emerald-100';
      textColor = 'text-emerald-800';
      break;
    case 'FAILED':
      bgColor = 'bg-rose-100';
      textColor = 'text-rose-800';
      break;
    case 'REFUNDED':
      bgColor = 'bg-purple-100';
      textColor = 'text-purple-800';
      break;
    case 'PENDING':
      bgColor = 'bg-orange-100';
      textColor = 'text-orange-800';
      break;
    default:
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {status.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
    </span>
  );
};

const Orders: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPayment, setSelectedPayment] = useState('All');
  const [dateRange, setDateRange] = useState<{ start: string, end: string }>({
    start: '',
    end: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    per_page: 50,
    total_pages: 0,
    has_next: false,
    has_prev: false
  });
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: 'ascending' | 'descending';
  }>({
    key: 'order_date',
    direction: 'descending',
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Build query parameters
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        per_page: pagination.per_page.toString(),
      });

      // Add filters if they are not set to 'All'
      if (selectedStatus !== 'All') {
        params.append('status', selectedStatus);
      }

      if (selectedPayment !== 'All') {
        params.append('payment_status', selectedPayment);
      }

      if (dateRange.start) {
        params.append('start_date', dateRange.start);
      }

      if (dateRange.end) {
        params.append('end_date', dateRange.end);
      }

      const apiUrl = `${API_BASE_URL}/api/merchant-dashboard/orders?${params.toString()}`;
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Failed to fetch orders: ${response.status} ${response.statusText}`);
      }

      const data: ApiResponse = await response.json();
      setOrders(data.orders);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error in fetchOrders:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch orders';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders when filters or pagination changes
  useEffect(() => {
    fetchOrders();
  }, [pagination.page, selectedStatus, selectedPayment, dateRange]);

  // Handle sort
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Filter orders based on search term only (since other filters are handled by API)
  const filteredOrders = React.useMemo(() => {
    if (!searchTerm) return orders;
    
    return orders.filter((order) => {
      return order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.shipping_address_details?.address_line1 || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.shipping_address_details?.city || '').toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [orders, searchTerm]);

  // Sort orders
  const sortedOrders = React.useMemo(() => {
    let sortableOrders = [...filteredOrders];
    if (sortConfig.key !== null) {
      sortableOrders.sort((a, b) => {
        if (sortConfig.key?.includes('.')) {
          const [parentKey, childKey] = sortConfig.key.split('.');
          
          if (parentKey === 'shipping_address_details') {
            const aValue = a.shipping_address_details[childKey as keyof Address];
            const bValue = b.shipping_address_details[childKey as keyof Address];
            
            if (aValue < bValue) {
              return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (aValue > bValue) {
              return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
          }
          return 0;
        } else {
          const aValue = a[sortConfig.key as keyof Order];
          const bValue = b[sortConfig.key as keyof Order];
          
          if (!aValue && !bValue) return 0;
          if (!aValue) return sortConfig.direction === 'ascending' ? -1 : 1;
          if (!bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
          
          if (aValue < bValue) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
          return 0;
        }
      });
    }
    return sortableOrders;
  }, [filteredOrders, sortConfig]);

  // Generate sort indicator
  const getSortIndicator = (key: string) => {
    if (sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'ascending' ? (
      <ArrowUpIcon className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDownIcon className="h-4 w-4 ml-1" />
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={fetchOrders} className="bg-orange-500 text-white px-4 py-2 rounded-md">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
        <div className="flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
            <PrinterIcon className="h-4 w-4 mr-2" />
            Export
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
            <DocumentTextIcon className="h-4 w-4 mr-2" />
            New Order
          </button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search orders..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
          >
            <option value="All">All Status</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status.replace('_', ' ')}
              </option>
            ))}
          </select>
          <select
            value={selectedPayment}
            onChange={(e) => setSelectedPayment(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
          >
            <option value="All">All Payment Status</option>
            {PAYMENT_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            More Filters
          </button>
        </div>
              
        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date-range" className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  id="date-start"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                />
                <input
                  type="date"
                  id="date-end"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>
        
      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Order ID', 'Date', 'Customer', 'Items', 'Total', 'Status', 'Payment', 'Actions'].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-orange-600"
                    onClick={() => requestSort(header.toLowerCase().replace(' ', '_'))}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{header}</span>
                      {getSortIndicator(header.toLowerCase().replace(' ', '_'))}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedOrders.map((order) => (
                <tr key={order.order_id} className="hover:bg-orange-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.order_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.order_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {order.shipping_address_details?.address_line1 || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.shipping_address_details?.city || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.items.length}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.currency} {parseFloat(order.total_amount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={order.order_status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={order.payment_status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <Link to={`/business/orders/${order.order_id}`} className="text-orange-600 hover:text-orange-900">
                        <EyeIcon className="h-5 w-5" />
                      </Link>
                      <button className="text-orange-600 hover:text-orange-900">
                        <PencilIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={!pagination.has_prev}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={!pagination.has_next}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{((pagination.page - 1) * pagination.per_page) + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.per_page, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.total}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={!pagination.has_prev}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={!pagination.has_next}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders; 