import React, { useState, useEffect } from 'react';
import { 
  ArrowUpIcon, 
  ArrowDownIcon,
  EyeIcon,
  PencilIcon,
  PrinterIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Define interfaces for type safety
interface Product {
  id: number;
  name: string;
  sku: string;
  category: {
    id: number;
    name: string;
    slug: string;
  } | null;
  brand: {
    id: number;
    name: string;
    slug: string;
  } | null;
  stock_qty: number;
  low_stock_threshold: number;
  available: number;
  image_url?: string;
}

interface InventoryStats {
  total_products: number;
  low_stock_products: number;
  out_of_stock_products: number;
  inventory_value: number;
  total_stock: number;
  low_stock_count: number;
  out_of_stock_count: number;
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
  products: Product[];
  pagination: PaginationInfo;
}

// Stock status options
const STOCK_STATUS_OPTIONS = [
  'All',
  'in_stock',
  'low_stock',
  'out_of_stock',
];

// Stock status badge component
const StockStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let bgColor = '';
  let textColor = '';
  
  switch (status) {
    case 'in_stock':
      bgColor = 'bg-emerald-100';
      textColor = 'text-emerald-800';
      break;
    case 'low_stock':
      bgColor = 'bg-amber-100';
      textColor = 'text-amber-800';
      break;
    case 'out_of_stock':
      bgColor = 'bg-rose-100';
      textColor = 'text-rose-800';
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

// Add this interface after the existing interfaces
interface UpdateStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onUpdate: (productId: number, stockData: { stock_qty: number; low_stock_threshold: number }) => Promise<void>;
}

// Add this component before the main Inventory component
const UpdateStockModal: React.FC<UpdateStockModalProps> = ({ isOpen, onClose, product, onUpdate }) => {
  const [stockQty, setStockQty] = useState(product.stock_qty);
  const [lowStockThreshold, setLowStockThreshold] = useState(product.low_stock_threshold);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onUpdate(product.id, {
        stock_qty: stockQty,
        low_stock_threshold: lowStockThreshold
      });
      onClose();
    } catch (error) {
      console.error('Error updating stock:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Update Stock</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="stockQty" className="block text-sm font-medium text-gray-700">
                Stock Quantity
              </label>
              <input
                type="number"
                id="stockQty"
                min="0"
                value={stockQty}
                onChange={(e) => setStockQty(parseInt(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-gray-700">
                Low Stock Threshold
              </label>
              <input
                type="number"
                id="lowStockThreshold"
                min="0"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(parseInt(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                {isSubmitting ? 'Updating...' : 'Update'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Add these interfaces after the existing interfaces
interface Category {
  category_id: number;
  name: string;
  slug: string;
}

interface Brand {
  brand_id: number;
  name: string;
  slug: string;
}

const Inventory: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<InventoryStats>({
    total_products: 0,
    low_stock_products: 0,
    out_of_stock_products: 0,
    inventory_value: 0,
    total_stock: 0,
    low_stock_count: 0,
    out_of_stock_count: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [selectedStockStatus, setSelectedStockStatus] = useState<string>('All');
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
    key: 'name',
    direction: 'ascending',
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);

  // Add debounce effect for search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchInventoryStats = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Fetching inventory stats...'); // Debug log
      const response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/inventory/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Stats response status:', response.status); // Debug log

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Stats error response:', errorData); // Debug log
        throw new Error(errorData?.error || `Failed to fetch inventory stats: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Received stats data:', data); // Debug log
      setStats(data);
    } catch (err) {
      console.error('Error in fetchInventoryStats:', err);
      console.error('Stats error stack:', err instanceof Error ? err.stack : 'No stack trace available'); // Debug log
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch inventory stats';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      toast.error('Failed to load categories');
    }
  };

  const fetchBrands = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/brands`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch brands');
      }

      const data = await response.json();
      setBrands(data);
    } catch (err) {
      console.error('Error fetching brands:', err);
      toast.error('Failed to load brands');
    }
  };

  const fetchProducts = async () => {
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

      if (debouncedSearchTerm) {
        params.append('search', debouncedSearchTerm.trim());
      }

      if (selectedCategory !== 'All') {
        params.append('category', selectedCategory);
      }

      if (selectedBrand !== 'All') {
        params.append('brand', selectedBrand);
      }

      if (selectedStockStatus !== 'All') {
        params.append('stock_status', selectedStockStatus);
      }

      const apiUrl = `${API_BASE_URL}/api/merchant-dashboard/inventory/products?${params.toString()}`;
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Failed to fetch products: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.products || !Array.isArray(data.products)) {
        throw new Error('Invalid response format: products array missing');
      }

      setProducts(data.products);
      setPagination({
        total: data.pagination.total,
        page: data.pagination.current_page,
        per_page: data.pagination.per_page,
        total_pages: data.pagination.pages,
        has_next: data.pagination.current_page < data.pagination.pages,
        has_prev: data.pagination.current_page > 1
      });
    } catch (err) {
      console.error('Error in fetchProducts:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (productId: number, stockData: { stock_qty: number; low_stock_threshold: number }) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/products/${productId}/stock`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(stockData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Failed to update stock: ${response.status} ${response.statusText}`);
      }

      const updatedProduct = await response.json();
      setProducts(products.map(p => p.id === productId ? { ...p, ...updatedProduct } : p));
      fetchInventoryStats();
      toast.success('Stock updated successfully');
    } catch (err) {
      console.error('Error in updateStock:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update stock';
      toast.error(errorMessage);
      throw err; // Re-throw to handle in the modal
    }
  };

  // Add this function to handle opening the modal
  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setIsUpdateModalOpen(true);
  };

  // Fetch data when filters or pagination changes
  useEffect(() => {
    fetchInventoryStats();
    fetchProducts();
  }, [pagination.page, selectedCategory, selectedBrand, selectedStockStatus, debouncedSearchTerm]);

  // Add useEffect to fetch categories and brands on component mount
  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  // Handle sort
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Sort products
  const sortedProducts = React.useMemo(() => {
    let sortableProducts = [...products];
    if (sortConfig.key !== null) {
      sortableProducts.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof Product];
        const bValue = b[sortConfig.key as keyof Product];
        
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
      });
    }
    return sortableProducts;
  }, [products, sortConfig]);

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
        <button onClick={fetchProducts} className="bg-orange-500 text-white px-4 py-2 rounded-md">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Inventory Management</h1>
        <div className="flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
            <PrinterIcon className="h-4 w-4 mr-2" />
            Export
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
            <DocumentTextIcon className="h-4 w-4 mr-2" />
            Add Product
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-5 flex items-center hover:border-orange-300 transition-colors">
          <div className="rounded-full bg-orange-100 p-3 mr-4">
            <DocumentTextIcon className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Products</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total_products}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-5 flex items-center hover:border-orange-300 transition-colors">
          <div className="rounded-full bg-orange-100 p-3 mr-4">
            <ExclamationCircleIcon className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Low Stock Alerts</p>
            <p className="text-2xl font-bold text-gray-900">{stats.low_stock_count}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-5 flex items-center hover:border-orange-300 transition-colors">
          <div className="rounded-full bg-orange-100 p-3 mr-4">
            <DocumentTextIcon className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Out of Stock Items</p>
            <p className="text-2xl font-bold text-gray-900">{stats.out_of_stock_count}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-5 flex items-center hover:border-orange-300 transition-colors">
          <div className="rounded-full bg-orange-100 p-3 mr-4">
            <CurrencyDollarIcon className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Stock</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total_stock}</p>
          </div>
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
              placeholder="Search by product name or SKU..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm pl-10"
            />
            
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
          >
            <option value="All">All Categories</option>
            {categories.map((category) => (
              <option key={category.category_id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
          >
            <option value="All">All Brands</option>
            {brands.map((brand) => (
              <option key={brand.brand_id} value={brand.slug}>
                {brand.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStockStatus}
            onChange={(e) => setSelectedStockStatus(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
          >
            <option value="All">All Stock Status</option>
            {STOCK_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
              </option>
            ))}
          </select>
        </div>
      </div>
        
      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Image', 'Product Name', 'SKU', 'Category', 'Brand', 'Stock Qty', 'Available', 'Status', 'Actions'].map((header) => (
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
              {sortedProducts.map((product) => (
                <tr key={product.id} className="hover:bg-orange-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-12 h-12 rounded-md bg-gray-200 flex items-center justify-center">
                      <img 
                        src={product.image_url || '/api/placeholder/50/50'} 
                        alt={product.name} 
                        className="h-10 w-10 rounded-md object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.sku}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.category?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.brand?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.stock_qty}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.available}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StockStatusBadge 
                      status={product.stock_qty === 0 ? 'out_of_stock' : 
                             product.stock_qty <= product.low_stock_threshold ? 'low_stock' : 
                             'in_stock'} 
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button 
                        className="text-orange-600 hover:text-orange-900"
                        onClick={() => handleEditClick(product)}
                      >
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

      {/* Add the modal component */}
      {selectedProduct && (
        <UpdateStockModal
          isOpen={isUpdateModalOpen}
          onClose={() => {
            setIsUpdateModalOpen(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
          onUpdate={updateStock}
        />
      )}
    </div>
  );
};

export default Inventory;