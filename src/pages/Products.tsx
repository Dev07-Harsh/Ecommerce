import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Heart, ChevronDown, ChevronUp } from 'lucide-react';
import { Product } from '../types';
import ProductCard from '../components/product/ProductCard';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Category {
  category_id: number;
  name: string;
  slug: string;
  icon_url: string;
  parent_id: number | null;
  children?: Category[];
}

const Products: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [perPage] = useState(16);

  // Add new state for expanded categories
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Handle product click to track recently viewed
  const handleProductClick = async (productId: string) => {
    try {
      // Navigate to product detail page
      navigate(`/product/${productId}`);
      
      // Track the view if user is authenticated
      const token = localStorage.getItem('access_token');
      if (token) {
        await fetch(`${API_BASE_URL}/api/products/${productId}/details`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        // Refresh recently viewed products
        fetchRecentlyViewed();
      }
    } catch (error) {
      console.error('Error tracking product view:', error);
    }
  };

  // Fetch recently viewed products
  const fetchRecentlyViewed = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/products/recently-viewed`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recently viewed products');
      }

      const data = await response.json();
      setRecentlyViewed(data);
    } catch (err) {
      console.error('Error fetching recently viewed products:', err);
    }
  };

  // Update selected category when URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryId = params.get('category');
    if (categoryId) {
      setSelectedCategory(categoryId);
      // Expand the parent category if it exists
      const category = categories.find(cat => cat.category_id === Number(categoryId));
      if (category?.parent_id !== null && category?.parent_id !== undefined) {
        setExpandedCategories(prev => ({
          ...prev,
          [String(category.parent_id)]: true
        }));
      }
    } else {
      setSelectedCategory('');
    }
  }, [location.search, categories]);

  // Toggle category expansion
  const toggleCategoryExpand = (categoryId: number) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Helper: find category depth and if leaf
  const getCategoryDepth = (cat: Category, parentDepth = 0): number => {
    if (!cat.children || cat.children.length === 0) return parentDepth;
    return Math.max(...cat.children.map(child => getCategoryDepth(child, parentDepth + 1)));
  };
  const isLeaf = (cat: Category) => !cat.children || cat.children.length === 0;

  // Render category tree recursively (Figma style)
  const renderCategoryTree = (category: Category, level: number = 0) => {
    const isExpanded = expandedCategories[category.category_id] || false;
    const hasSubcategories = category.children && category.children.length > 0;
    const isSelected = selectedCategory === String(category.category_id);
    const isLeafCategory = !category.children || category.children.length === 0;

    // Style logic
    let btnClass = 'w-full flex items-center justify-between py-2 px-2 transition-colors border-none text-left font-normal';
    let spanClass = 'text-sm font-normal';
    if (level === 0) {
      btnClass += ' bg-transparent text-black hover:bg-orange-50 rounded-none';
    } else if (hasSubcategories) {
      if (isSelected) {
        btnClass += ' bg-white border border-[#F2631F] text-black rounded-md shadow-sm';
      } else {
        btnClass += ' bg-transparent text-black hover:bg-orange-50 rounded-md';
      }
    } else {
      if (isSelected) {
        btnClass += ' bg-[#F2631F] text-white rounded-md shadow';
      } else {
        btnClass += ' bg-transparent text-black hover:bg-orange-50 rounded-md';
      }
    }

    return (
      <div key={category.category_id}>
        <button
          onClick={() => {
            if (hasSubcategories) {
              toggleCategoryExpand(category.category_id);
            } else {
              setSelectedCategory(String(category.category_id));
              // Update URL with selected category
              const params = new URLSearchParams(location.search);
              params.set('category', String(category.category_id));
              navigate(`?${params.toString()}`);
            }
          }}
          className={btnClass}
          style={{ paddingLeft: `${level * 1.25}rem` }}
        >
          <span className={spanClass}>{category.name}</span>
          {hasSubcategories && (
            <span className="flex items-center ml-auto">
              {isExpanded ? (
                <ChevronUp size={16} className="text-[#F2631F]" />
              ) : (
                <ChevronDown size={16} className="text-[#F2631F]" />
              )}
            </span>
          )}
        </button>
        {isExpanded && category.children && (
          <div className="ml-0">
            {category.children.map(subcategory => renderCategoryTree(subcategory, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Fetch products with filters
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: perPage.toString(),
        sort_by: 'created_at',
        order: 'desc'
      });

      // Get URL parameters
      const urlParams = new URLSearchParams(location.search);
      const categoryId = urlParams.get('category');
      const brandId = urlParams.get('brand');

      // Add filters if they exist
      if (categoryId) {
        params.append('category_id', categoryId);
      }
      if (brandId) {
        params.append('brand_id', brandId);
        // If brand is selected via URL, update selectedBrands
        setSelectedBrands([brandId]);
      } else if (selectedBrands.length > 0) {
        params.append('brand_id', selectedBrands.join(','));
      }
      if (priceRange[0] > 0) {
        params.append('min_price', priceRange[0].toString());
      }
      if (priceRange[1] < 1000000) {
        params.append('max_price', priceRange[1].toString());
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      // Always use the main products endpoint with filters
      const apiUrl = `${API_BASE_URL}/api/products?${params}`;

      console.log('Fetching products with URL:', apiUrl);

      const response = await fetch(apiUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }

      const data = await response.json();
      console.log('Products response:', data);
      
      setProducts(data.products);
      setTotalPages(data.pagination.pages);
      setTotalProducts(data.pagination.total);

      // Update selected category if coming from navigation
      if (categoryId && !selectedCategory) {
        setSelectedCategory(categoryId);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  // Update URL when brand selection changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (selectedBrands.length > 0) {
      const brand = brands.find(b => String(b.brand_id) === selectedBrands[0]);
      if (brand) {
        params.set('brand', brand.slug);
      }
    } else {
      params.delete('brand');
    }
    navigate(`?${params.toString()}`);
  }, [selectedBrands, brands, navigate, location.search]);

  // Update fetchCategories to use the new categories endpoint
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories/all`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      console.log('Categories data:', data);
      // No need to organize categories as they come pre-organized from the backend
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Fetch brands
  const fetchBrands = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/brands/`);
      if (!response.ok) {
        throw new Error('Failed to fetch brands');
      }
      const data = await response.json();
      console.log('Brands data:', data);
      setBrands(data);
    } catch (err) {
      console.error('Error fetching brands:', err);
    }
  };

  // Initial data fetch
  useEffect(() => {
    console.log('Initial data fetch started');
    console.log('API Base URL:', API_BASE_URL);
    fetchProducts();
    fetchRecentlyViewed();
    fetchCategories();
    fetchBrands();
  }, []);

  // Refetch products when filters or pagination changes
  useEffect(() => {
    console.log('Refetching products due to filter/pagination change:', {
      currentPage,
      selectedCategory,
      selectedBrands,
      priceRange,
      searchQuery
    });
    fetchProducts();
  }, [currentPage, selectedCategory, selectedBrands, priceRange, searchQuery]);
  
  // Toggle brand selection
  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => {
      const newBrands = prev.includes(brand)
        ? [] // Clear selection if clicking the same brand
        : [brand]; // Select only one brand at a time
      
      // Update URL with selected brand
      const params = new URLSearchParams(location.search);
      if (newBrands.length > 0) {
        params.set('brand', newBrands[0]);
      } else {
        params.delete('brand');
      }
      navigate(`?${params.toString()}`);
      
      return newBrands;
    });
  };

  // Toggle color selection
  const toggleColor = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) 
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedBrands([]);
    setSelectedColors([]);
    setPriceRange([0, 1000000]);
    setCurrentPage(1);
    
    // Clear URL parameters
    const params = new URLSearchParams(location.search);
    params.delete('category');
    params.delete('brand');
    params.delete('search');
    navigate(`?${params.toString()}`);
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold mb-2">Error Loading Products</p>
          <p>{error}</p>
          <button 
            onClick={() => fetchProducts()}
            className="mt-4 px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-4">
        {/* Breadcrumb */}
        <div className="text-xs text-gray-500 mb-4">
          <span>Home</span> / <span>Products</span>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Category Sidebar */}
          <aside className="w-full md:w-64 pr-4 border-r border-gray-100">
            <div className="mb-8">
              <h3 className="font-semibold text-base mb-3 text-black">Category</h3>
              <div className="space-y-1">
                {categories.map(category => renderCategoryTree(category))}
              </div>
            </div>
            
            {/* Brand Filter */}
            <div className="mb-8">
              <h3 className="font-semibold text-base mb-3 text-black">Brand</h3>
              <div className="flex flex-wrap gap-2">
                {brands && brands.map((brand) => {
                  const isSelected = selectedBrands.includes(String(brand.brand_id || brand.id));
                  return (
                    <button
                      key={brand.brand_id || brand.id}
                      onClick={() => toggleBrand(String(brand.brand_id || brand.id))}
                      className={`px-3 py-1.5 rounded-full border text-xs font-normal transition-colors focus:outline-none ${
                        isSelected
                          ? 'bg-[#F2631F] text-white border-[#F2631F] shadow'
                          : 'bg-gray-100 border-gray-200 text-black hover:border-[#F2631F] hover:text-[#F2631F]'
                      }`}
                    >
                      {brand.name || brand.brand_name}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Price Range */}
            <div className="mb-8">
              <h3 className="font-semibold text-base mb-3 text-black">Price</h3>
              <div className="px-2">
                <div className="flex justify-between text-xs text-gray-700 mb-2 font-normal">
                  <span>₹{priceRange[0]}</span>
                  <span>₹{priceRange[1]}</span>
                </div>
                <div className="relative pt-1">
                  <div className="w-full h-1 bg-gray-200 rounded-lg">
                    <div
                      className="absolute h-1 bg-[#F2631F] rounded-lg"
                      style={{ width: `${(priceRange[1] / 1000000) * 100}%` }}
                    ></div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1000000"
                    step="10000"
                    value={priceRange[1]}
                    onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="absolute top-0 w-full h-2 opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Reset Filters */}
            <button
              onClick={resetFilters}
              className="w-full px-4 py-2 text-sm font-normal text-[#F2631F] border border-[#F2631F] rounded hover:bg-orange-50 transition-colors"
            >
              Reset Filters
            </button>
          </aside>
          
          {/* Products Grid */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {products.map((product) => (
                <div 
                  key={product.id}
                  onClick={() => handleProductClick(String(product.id))}
                  className="cursor-pointer"
                >
                  <ProductCard 
                    product={product}
                    isNew={product.isNew ?? false}
                    isBuiltIn={product.isBuiltIn ?? false}
                  />
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
            <div className="flex justify-center items-center gap-1 my-6">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded disabled:opacity-50"
                >
                <ChevronLeft className="h-4 w-4" />
              </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-6 h-6 flex items-center justify-center border rounded ${
                      currentPage === i + 1
                        ? 'bg-primary-500 text-white border-primary-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded disabled:opacity-50"
                >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            )}
          </div>
        </div>

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
        <div className="mt-8 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-medium">Recently Viewed</h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {recentlyViewed.map((product) => (
                <div 
                  key={product.id}
                  onClick={() => handleProductClick(String(product.id))}
                  className="cursor-pointer"
                >
                  <ProductCard
                    product={product}
                    isNew={product.isNew ?? false}
                    isBuiltIn={product.isBuiltIn ?? false}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;