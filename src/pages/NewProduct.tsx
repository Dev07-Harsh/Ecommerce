import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, SlidersHorizontal, ArrowUpDown, X, Check, ChevronDown } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import { Product } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const NewProduct: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDesktopSortOpen, setIsDesktopSortOpen] = useState(false);
  const [isMobileSortOpen, setIsMobileSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState('newest');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [perPage] = useState(16);

  // Refs for dropdowns
  const desktopSortRef = useRef<HTMLDivElement>(null);
  const mobileSortRef = useRef<HTMLDivElement>(null);

  // Sort options
  const sortOptions = [
    { label: 'Newest First', value: 'newest', sort_by: 'created_at', order: 'desc' },
    { label: 'Oldest First', value: 'oldest', sort_by: 'created_at', order: 'asc' },
    { label: 'Price: High to Low', value: 'price-desc', sort_by: 'selling_price', order: 'desc' },
    { label: 'Price: Low to High', value: 'price-asc', sort_by: 'selling_price', order: 'asc' }
  ];

  // Sort products based on selected sort option
  const sortProducts = (productsToSort: Product[], sortValue: string) => {
    const sortedProducts = [...productsToSort];
    switch (sortValue) {
      case 'newest':
        return sortedProducts.sort((a, b) => 
          new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
        );
      case 'oldest':
        return sortedProducts.sort((a, b) => 
          new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime()
        );
      case 'price-desc':
        return sortedProducts.sort((a, b) => b.price - a.price);
      case 'price-asc':
        return sortedProducts.sort((a, b) => a.price - b.price);
      default:
        return sortedProducts;
    }
  };

  // Fetch new products
  const fetchNewProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: perPage.toString()
      });

      const apiUrl = `${API_BASE_URL}/api/products/new?${params}`;
      console.log('Fetching new products with URL:', apiUrl);

      const response = await fetch(apiUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch new products: ${response.status}`);
      }

      const data = await response.json();
      console.log('New products response:', data);
      
      // Transform the API response to match the Product type
      const transformedProducts = data.products.map((product: any) => {
        const imageUrl = product.image || product.primary_image || '';
        
        return {
          id: product.id || product.product_id.toString(),
          name: product.name || product.product_name,
          price: parseFloat(product.price || product.selling_price),
          originalPrice: parseFloat(product.originalPrice || product.cost_price),
          description: product.description || product.product_description || '',
          sku: product.sku,
          stock: product.stock || 0,
          rating: product.rating || 0,
          reviews: product.reviews || [],
          currency: 'INR',
          primary_image: imageUrl,
          image: imageUrl,
          isNew: true,
          isBuiltIn: false,
          category: {
            category_id: product.category?.category_id || product.category_id || 0,
            name: product.category?.name || ''
          },
          brand: {
            brand_id: product.brand?.brand_id || product.brand_id || 0,
            name: product.brand?.name || ''
          },
          active_flag: product.active_flag,
          approval_status: product.approval_status,
          approved_at: product.approved_at,
          attributes: product.attributes || [],
          created_at: product.created_at
        };
      });
      
      // Sort the transformed products
      const sortedProducts = sortProducts(transformedProducts, selectedSort);
      console.log('Transformed and sorted products:', sortedProducts);
      
      setProducts(sortedProducts);
      setTotalPages(data.pagination.pages);
      setTotalProducts(data.pagination.total);
    } catch (err) {
      console.error('Error fetching new products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch new products');
    } finally {
      setLoading(false);
    }
  };

  // Handle sort change
  const handleSort = (value: string) => {
    setSelectedSort(value);
    setIsMobileSortOpen(false);
    setIsDesktopSortOpen(false);
    // Sort existing products without making a new API call
    setProducts(prevProducts => sortProducts(prevProducts, value));
  };

  // Fetch products on mount and when pagination changes
  useEffect(() => {
    fetchNewProducts();
  }, [currentPage]);

  // Reset filters
  const resetFilters = () => {
    setActiveFilter(null);
    setFilterType(null);
    setIsFilterOpen(false);
    setSelectedSort('newest');
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (desktopSortRef.current && !desktopSortRef.current.contains(event.target as Node)) {
        setIsDesktopSortOpen(false);
      }
      if (mobileSortRef.current && !mobileSortRef.current.contains(event.target as Node)) {
        setIsMobileSortOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Loading state
  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold mb-2">Error Loading Products</p>
          <p>{error}</p>
          <button 
            onClick={() => fetchNewProducts()}
            className="mt-4 px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3 sm:gap-0">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-gray-900">New Products</h1>
            {activeFilter && (
              <div className="text-sm text-gray-600 mt-1">
                {filterType === 'category' && `Category: ${activeFilter}`}
                {filterType === 'brand' && `Brand: ${activeFilter}`}
              </div>
            )}
          </div>

          {/* Desktop Sort Dropdown */}
          <div className="hidden sm:flex relative" ref={desktopSortRef}>
            <button
              className="flex items-center gap-2 px-4 py-2 border rounded-md bg-white"
              onClick={() => setIsDesktopSortOpen(!isDesktopSortOpen)}
            >
              <span>Sort By: </span>
              <span>
                {sortOptions.find(opt => opt.value === selectedSort)?.label}
              </span>
              <ChevronDown size={16} />
            </button>

            {isDesktopSortOpen && (
              <div className="absolute z-20 w-full bg-white border rounded-md shadow-lg top-full">
                {sortOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleSort(option.value)}
                    className={`flex items-center w-full px-4 py-2 text-left hover:bg-gray-100 ${
                      selectedSort === option.value ? 'bg-gray-100' : ''
                    }`}
                  >
                    {selectedSort === option.value && <Check size={16} className="mr-2 text-primary-600" />}
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filter and Sort Bar */}
        <div className="sm:hidden flex items-center gap-2 mb-4">
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg"
          >
            <SlidersHorizontal size={20} />
            <span>Filters</span>
          </button>
          <button
            onClick={() => setIsMobileSortOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg"
          >
            <ArrowUpDown size={20} />
            <span>Sort</span>
          </button>
        </div>

        {products.length === 0 ? (
          <div className="flex justify-center items-center py-16">
            <p className="text-gray-500">No new products available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            {products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                isNew={product.isNew}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 mb-8">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border border-gray-200 text-gray-700 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded mx-1 ${
                  currentPage === i + 1
                    ? 'bg-[#F15A24] text-white'
                    : 'border border-gray-200 text-gray-700'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border border-gray-200 text-gray-700 disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Mobile Sort Dropdown */}
      {isMobileSortOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40">
          <div ref={mobileSortRef} className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Sort By</h3>
                <button onClick={() => setIsMobileSortOpen(false)} className="p-2">
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-2">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSort(option.value)}
                    className={`w-full text-left px-4 py-3 rounded-lg ${
                      selectedSort === option.value
                        ? 'bg-orange-50 text-[#F2631F]'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewProduct; 