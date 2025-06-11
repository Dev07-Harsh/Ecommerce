import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  FunnelIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface WholesaleProduct {
  product_id: number;
  product_name: string;
  sku: string;
  category_id: number;
  brand_id: number;
  cost_price: number;
  selling_price: number;
  special_price: number | null;
  special_start: string | null;
  special_end: string | null;
  active_flag: boolean;
  approval_status: 'pending' | 'approved' | 'rejected';
  approved_at: string | null;
  approved_by: number | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  category?: {
    category_id: number;
    name: string;
  };
  brand?: {
    brand_id: number;
    name: string;
  };
  media?: Array<{
    media_id: number;
    url: string;
    type: 'IMAGE' | 'VIDEO';
  }>;
  variants?: Array<{
    variant_id: number;
    sku: string;
    price: string | number;
    stock: string | number;
    attributes: Array<{
      name: string;
      value: string;
    }>;
    media?: Array<{
      media_id: number;
      media_url: string;
      media_type: string;
      is_primary: boolean;
    }>;
  }>;
}

// Status badge component
const StatusBadge: React.FC<{ active: boolean }> = ({ active }) => {
  const bgColor = active ? 'bg-green-100' : 'bg-gray-100';
  const textColor = active ? 'text-green-800' : 'text-gray-800';
  const status = active ? 'Active' : 'Inactive';
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {status}
    </span>
  );
};

// Approval Status Badge component
const ApprovalStatusBadge: React.FC<{ status: 'pending' | 'approved' | 'rejected', reason?: string | null }> = ({ status, reason }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'pending':
      default:
        return 'Pending';
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyles()}`}>
        {getStatusText()}
      </span>
      {status === 'rejected' && reason && (
        <span className="text-xs text-red-600">{reason}</span>
      )}
    </div>
  );
};

const formatPrice = (price: string | number): string => {
  if (typeof price === 'string') {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  }
  return price.toFixed(2);
};

const formatStock = (stock: string | number | undefined): string => {
  if (stock === undefined || stock === null) {
    return '0';
  }
  if (typeof stock === 'string') {
    const numStock = parseInt(stock);
    return isNaN(numStock) ? '0' : numStock.toString();
  }
  return stock.toString();
};

const Wholesale: React.FC = () => {
  const [products, setProducts] = useState<WholesaleProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: 'ascending' | 'descending';
  }>({
    key: null,
    direction: 'ascending',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/products`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch wholesale products');
      }

      const data = await response.json();
      
      const productsWithVariants = await Promise.all(
        data.map(async (product: WholesaleProduct) => {
          try {
            const variantsResponse = await fetch(
              `${API_BASE_URL}/api/merchant-dashboard/products/${product.product_id}/variants`,
              {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                  'Content-Type': 'application/json',
                },
              }
            );
            
            if (variantsResponse.ok) {
              const variantsData = await variantsResponse.json();
              return { ...product, variants: variantsData };
            }
            return product;
          } catch (error) {
            console.error(`Error fetching variants for product ${product.product_id}:`, error);
            return product;
          }
        })
      );

      setProducts(productsWithVariants);
    } catch (error) {
      console.error('Error fetching wholesale products:', error);
      setError('Failed to load wholesale products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!window.confirm('Are you sure you want to delete this wholesale product?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete wholesale product');
      }

      setProducts(products.filter(p => p.product_id !== productId));
    } catch (error) {
      console.error('Error deleting wholesale product:', error);
      alert('Failed to delete wholesale product');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedItems.length} wholesale products?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/products/bulk-delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ product_ids: selectedItems }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete wholesale products');
      }

      setProducts(products.filter(p => !selectedItems.includes(p.product_id)));
      setSelectedItems([]);
    } catch (error) {
      console.error('Error deleting wholesale products:', error);
      alert('Failed to delete wholesale products');
    }
  };

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });

    const sortedProducts = [...products].sort((a, b) => {
      if (key === 'product_name') {
        return direction === 'ascending' 
          ? a.product_name.localeCompare(b.product_name)
          : b.product_name.localeCompare(a.product_name);
      }
      if (key === 'price') {
        return direction === 'ascending'
          ? a.selling_price - b.selling_price
          : b.selling_price - a.selling_price;
      }
      if (key === 'stock') {
        const aStock = a.variants?.reduce((sum, v) => sum + Number(v.stock), 0) || 0;
        const bStock = b.variants?.reduce((sum, v) => sum + Number(v.stock), 0) || 0;
        return direction === 'ascending' ? aStock - bStock : bStock - aStock;
      }
      return 0;
    });

    setProducts(sortedProducts);
  };

  const getSortIndicator = (key: string) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? (
      <ArrowUpIcon className="w-4 h-4" />
    ) : (
      <ArrowDownIcon className="w-4 h-4" />
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === products.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(products.map(p => p.product_id));
    }
  };

  const toggleSelectItem = (id: number) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All Categories');
    setSelectedStatus('All');
    setMinPrice('');
    setMaxPrice('');
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || 
                          product.category?.name === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || 
                         (selectedStatus === 'Active' && product.active_flag) ||
                         (selectedStatus === 'Inactive' && !product.active_flag);
    const matchesPrice = (!minPrice || product.selling_price >= parseFloat(minPrice)) &&
                        (!maxPrice || product.selling_price <= parseFloat(maxPrice));

    return matchesSearch && matchesCategory && matchesStatus && matchesPrice;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Wholesale Products</h1>
        <Link
          to="/business/catalog/wholesale/new"
          className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-700"
        >
          <PlusIcon className="w-5 h-5" />
          Add Wholesale Product
        </Link>
      </div>

      {/* Combined Card for Search, Filters, and Table */}
      <div className="bg-white rounded-lg shadow-md">
        {/* Search and Filter Bar */}
        <div className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Status Dropdown */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              <FunnelIcon className="w-5 h-5" />
              Show Filters
            </button>

            {selectedItems.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Delete Selected ({selectedItems.length})
              </button>
            )}
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Price Range Filters */}
              <div>
                <label htmlFor="price-min" className="block text-sm font-medium text-gray-700 mb-1">
                  Price Range
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    id="price-min"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="block w-full pl-3 pr-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  />
                  <input
                    type="number"
                    id="price-max"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="block w-full pl-3 pr-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* Filter Buttons */}
              <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-orange-50 focus:outline-none mr-2"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === products.length}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name / SKU
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('price')}
                >
                  <div className="flex items-center gap-2">
                    Price / Category / Brand
                    {getSortIndicator('price')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('stock')}
                >
                  <div className="flex items-center gap-2">
                    Variants
                    {getSortIndicator('stock')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Approval
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.product_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(product.product_id)}
                      onChange={() => toggleSelectItem(product.product_id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">
                        {product.product_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        SKU: {product.sku}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>${formatPrice(product.selling_price)}</div>
                    <div className="text-xs text-gray-500">{product.category?.name || 'No Category'}</div>
                    <div className="text-xs text-gray-500">{product.brand?.name || 'No Brand'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.variants?.length || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge active={product.active_flag} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ApprovalStatusBadge 
                      status={product.approval_status} 
                      reason={product.rejection_reason}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/business/catalog/wholesale/${product.product_id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </Link>
                      <Link
                        to={`/business/catalog/wholesale/${product.product_id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleDeleteProduct(product.product_id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Wholesale; 