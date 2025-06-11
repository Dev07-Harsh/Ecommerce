import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Heart, ChevronDown, ChevronUp, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { Product } from '../types';
import ProductCard from '../components/product/ProductCard';

interface Category {
  category_id: number;
  name: string;
  slug: string;
  icon_url: string;
  parent_id: number | null;
  children?: Category[];
}

interface Brand {
  id: number;
  name: string;
  slug: string;
}

interface ShopInfo {
  id: number;
  name: string;
  description: string;
  openingTime: string;
  closingTime: string;
  category: string;
}

const ShopProducts: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { shopId } = useParams<{ shopId: string }>();
  
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [shopInfo, setShopInfo] = useState<ShopInfo | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  
  // Mobile filter states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState('newest');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(16);

  // Add new state for expanded categories
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Demo shop data
  const getShopInfo = (id: string): ShopInfo => {
    const shops: Record<string, ShopInfo> = {
      'fashion': {
        id: 1,
        name: "Fashion Hub",
        description: "Trendy clothing and accessories for every style",
        openingTime: "10:00 AM",
        closingTime: "10:00 PM",
        category: "Fashion"
      },
      'watches': {
        id: 2,
        name: "Watch Store",
        description: "Premium timepieces for every occasion",
        openingTime: "9:00 AM",
        closingTime: "9:00 PM",
        category: "Watches"
      },
      'electronics': {
        id: 3,
        name: "Electronics Mega Store",
        description: "Latest gadgets and electronics",
        openingTime: "8:00 AM",
        closingTime: "11:00 PM",
        category: "Electronics"
      },
      'footwear': {
        id: 4,
        name: "Footwear Store",
        description: "Step up your shoe game",
        openingTime: "10:00 AM",
        closingTime: "9:30 PM",
        category: "Footwear"
      }
    };
    return shops[id] || shops['fashion'];
  };

  // Demo categories
  const categories: Category[] = [
    {
      category_id: 1,
      name: 'Electronics',
      slug: 'electronics',
      icon_url: '',
      parent_id: null,
      children: [
        { category_id: 11, name: 'Smartphones', slug: 'smartphones', icon_url: '', parent_id: 1 },
        { category_id: 12, name: 'Laptops', slug: 'laptops', icon_url: '', parent_id: 1 },
        { category_id: 13, name: 'Tablets', slug: 'tablets', icon_url: '', parent_id: 1 },
        { category_id: 14, name: 'Headphones', slug: 'headphones', icon_url: '', parent_id: 1 },
      ]
    },
    {
      category_id: 2,
      name: 'Fashion',
      slug: 'fashion',
      icon_url: '',
      parent_id: null,
      children: [
        { category_id: 21, name: 'Men\'s Clothing', slug: 'mens-clothing', icon_url: '', parent_id: 2 },
        { category_id: 22, name: 'Women\'s Clothing', slug: 'womens-clothing', icon_url: '', parent_id: 2 },
        { category_id: 23, name: 'Accessories', slug: 'accessories', icon_url: '', parent_id: 2 },
        { category_id: 24, name: 'Bags', slug: 'bags', icon_url: '', parent_id: 2 },
      ]
    },
    {
      category_id: 3,
      name: 'Footwear',
      slug: 'footwear',
      icon_url: '',
      parent_id: null,
      children: [
        { category_id: 31, name: 'Sneakers', slug: 'sneakers', icon_url: '', parent_id: 3 },
        { category_id: 32, name: 'Boots', slug: 'boots', icon_url: '', parent_id: 3 },
        { category_id: 33, name: 'Sandals', slug: 'sandals', icon_url: '', parent_id: 3 },
        { category_id: 34, name: 'Formal Shoes', slug: 'formal-shoes', icon_url: '', parent_id: 3 },
      ]
    },
    {
      category_id: 4,
      name: 'Watches',
      slug: 'watches',
      icon_url: '',
      parent_id: null,
      children: [
        { category_id: 41, name: 'Smart Watches', slug: 'smart-watches', icon_url: '', parent_id: 4 },
        { category_id: 42, name: 'Analog Watches', slug: 'analog-watches', icon_url: '', parent_id: 4 },
        { category_id: 43, name: 'Digital Watches', slug: 'digital-watches', icon_url: '', parent_id: 4 },
        { category_id: 44, name: 'Luxury Watches', slug: 'luxury-watches', icon_url: '', parent_id: 4 },
      ]
    }
  ];

  // Demo brands
  const brands: Brand[] = [
    { id: 1, name: 'Samsung', slug: 'samsung' },
    { id: 2, name: 'Apple', slug: 'apple' },
    { id: 3, name: 'Nike', slug: 'nike' },
    { id: 4, name: 'Adidas', slug: 'adidas' },
    { id: 5, name: 'Puma', slug: 'puma' },
    { id: 6, name: 'Sony', slug: 'sony' },
    { id: 7, name: 'Titan', slug: 'titan' },
    { id: 8, name: 'Fossil', slug: 'fossil' },
    { id: 9, name: 'Libas', slug: 'libas' },
    { id: 10, name: 'W', slug: 'w' },
    { id: 11, name: 'Biba', slug: 'biba' },
    { id: 12, name: 'Global Desi', slug: 'global-desi' },
  ];

  // Demo products for each shop
  const getShopProducts = (shopId: string): Product[] => {
    const allProducts: Record<string, Product[]> = {
      fashion: [
        {
          id: 'f1',
          name: 'Women\'s Elegant Dress',
          price: 2999,
          originalPrice: 3999,
          category: 'Women\'s Clothing',
          description: 'Beautiful elegant dress perfect for special occasions',
          image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=600&auto=format&fit=crop',
          sku: 'WD-001',
          stock: 25,
          rating: 4.6,
          reviews: 89,
          currency: '₹',
          brand: 'Libas',
          isNew: true
        },
        {
          id: 'f2',
          name: 'Men\'s Casual Shirt',
          price: 1599,
          category: 'Men\'s Clothing',
          description: 'Comfortable cotton casual shirt for everyday wear',
          image: 'https://images.unsplash.com/photo-1564859228273-274232fdb516?q=80&w=600&auto=format&fit=crop',
          sku: 'MS-001',
          stock: 40,
          rating: 4.3,
          reviews: 56,
          currency: '₹',
          brand: 'W'
        },
        {
          id: 'f3',
          name: 'Designer Handbag',
          price: 4999,
          originalPrice: 6999,
          category: 'Accessories',
          description: 'Premium leather handbag with elegant design',
          image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600&auto=format&fit=crop',
          sku: 'HB-001',
          stock: 15,
          rating: 4.8,
          reviews: 124,
          currency: '₹',
          brand: 'Biba'
        },
        {
          id: 'f4',
          name: 'Ethnic Kurta Set',
          price: 3499,
          category: 'Women\'s Clothing',
          description: 'Traditional ethnic wear with modern touch',
          image: 'https://images.unsplash.com/photo-1583391733956-6c78e2c2087f?q=80&w=600&auto=format&fit=crop',
          sku: 'KS-001',
          stock: 20,
          rating: 4.7,
          reviews: 78,
          currency: '₹',
          brand: 'Global Desi',
          isNew: true
        },
        {
          id: 'f5',
          name: 'Denim Jacket',
          price: 2799,
          category: 'Men\'s Clothing',
          description: 'Classic denim jacket for casual styling',
          image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=600&auto=format&fit=crop',
          sku: 'DJ-001',
          stock: 30,
          rating: 4.4,
          reviews: 92,
          currency: '₹',
          brand: 'Libas'
        },
        {
          id: 'f6',
          name: 'Summer Floral Dress',
          price: 1999,
          originalPrice: 2799,
          category: 'Women\'s Clothing',
          description: 'Light and breezy floral dress for summer',
          image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=600&auto=format&fit=crop',
          sku: 'SD-001',
          stock: 35,
          rating: 4.5,
          reviews: 67,
          currency: '₹',
          brand: 'W'
        }
      ],
      watches: [
        {
          id: 'w1',
          name: 'Titan Smart Watch Pro',
          price: 12999,
          originalPrice: 15999,
          category: 'Smart Watches',
          description: 'Advanced smartwatch with health monitoring and GPS',
          image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=600&auto=format&fit=crop',
          sku: 'TSW-001',
          stock: 18,
          rating: 4.7,
          reviews: 145,
          currency: '₹',
          brand: 'Titan',
          isNew: true
        },
        {
          id: 'w2',
          name: 'Fossil Analog Classic',
          price: 8999,
          category: 'Analog Watches',
          description: 'Elegant analog watch with leather strap',
          image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=600&auto=format&fit=crop',
          sku: 'FAC-001',
          stock: 25,
          rating: 4.6,
          reviews: 89,
          currency: '₹',
          brand: 'Fossil'
        },
        {
          id: 'w3',
          name: 'Digital Sports Watch',
          price: 3999,
          originalPrice: 4999,
          category: 'Digital Watches',
          description: 'Rugged digital watch perfect for sports',
          image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?q=80&w=600&auto=format&fit=crop',
          sku: 'DSW-001',
          stock: 40,
          rating: 4.4,
          reviews: 156,
          currency: '₹',
          brand: 'Titan'
        },
        {
          id: 'w4',
          name: 'Luxury Gold Watch',
          price: 25999,
          category: 'Luxury Watches',
          description: 'Premium gold-plated luxury timepiece',
          image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?q=80&w=600&auto=format&fit=crop',
          sku: 'LGW-001',
          stock: 8,
          rating: 4.9,
          reviews: 45,
          currency: '₹',
          brand: 'Fossil',
          isNew: true
        }
      ],
      electronics: [
        {
          id: 'e1',
          name: 'Samsung Galaxy S24',
          price: 79999,
          originalPrice: 89999,
          category: 'Smartphones',
          description: 'Latest flagship smartphone with AI features',
          image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop',
          sku: 'SGS24-001',
          stock: 12,
          rating: 4.8,
          reviews: 234,
          currency: '₹',
          brand: 'Samsung',
          isNew: true
        },
        {
          id: 'e2',
          name: 'MacBook Air M3',
          price: 119999,
          category: 'Laptops',
          description: 'Ultra-thin laptop with M3 chip for professionals',
          image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=600&auto=format&fit=crop',
          sku: 'MBA-M3-001',
          stock: 8,
          rating: 4.9,
          reviews: 156,
          currency: '₹',
          brand: 'Apple'
        },
        {
          id: 'e3',
          name: 'Sony WH-1000XM5',
          price: 29999,
          originalPrice: 34999,
          category: 'Headphones',
          description: 'Premium noise-cancelling wireless headphones',
          image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=600&auto=format&fit=crop',
          sku: 'SWH-001',
          stock: 22,
          rating: 4.7,
          reviews: 189,
          currency: '₹',
          brand: 'Sony'
        },
        {
          id: 'e4',
          name: 'iPad Pro 12.9"',
          price: 109999,
          category: 'Tablets',
          description: 'Professional tablet with M2 chip and stunning display',
          image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=600&auto=format&fit=crop',
          sku: 'IPP-129-001',
          stock: 15,
          rating: 4.8,
          reviews: 124,
          currency: '₹',
          brand: 'Apple',
          isNew: true
        }
      ],
      footwear: [
        {
          id: 's1',
          name: 'Nike Air Max 270',
          price: 12999,
          originalPrice: 14999,
          category: 'Sneakers',
          description: 'Comfortable running shoes with air cushioning',
          image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop',
          sku: 'NAM-270-001',
          stock: 30,
          rating: 4.6,
          reviews: 201,
          currency: '₹',
          brand: 'Nike',
          isNew: true
        },
        {
          id: 's2',
          name: 'Adidas Ultraboost 22',
          price: 15999,
          category: 'Sneakers',
          description: 'Premium running shoes with boost technology',
          image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600&auto=format&fit=crop',
          sku: 'AUB-22-001',
          stock: 25,
          rating: 4.7,
          reviews: 178,
          currency: '₹',
          brand: 'Adidas'
        },
        {
          id: 's3',
          name: 'Puma RS-X',
          price: 8999,
          originalPrice: 10999,
          category: 'Sneakers',
          description: 'Retro-inspired lifestyle sneakers',
          image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=600&auto=format&fit=crop',
          sku: 'PRS-X-001',
          stock: 35,
          rating: 4.4,
          reviews: 134,
          currency: '₹',
          brand: 'Puma'
        },
        {
          id: 's4',
          name: 'Formal Leather Shoes',
          price: 6999,
          category: 'Formal Shoes',
          description: 'Classic formal leather shoes for office wear',
          image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=600&auto=format&fit=crop',
          sku: 'FLS-001',
          stock: 20,
          rating: 4.3,
          reviews: 89,
          currency: '₹',
          brand: 'Nike'
        }
      ]
    };
    return allProducts[shopId] || [];
  };

  // Demo recently viewed products
  const demoRecentlyViewed: Product[] = [
    {
      id: 'rv1',
      name: 'Previously Viewed Item 1',
      price: 1999,
      category: 'Electronics',
      description: 'Sample recently viewed product',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop',
      sku: 'RV-001',
      stock: 10,
      rating: 4.2,
      reviews: 45,
      currency: '₹',
      brand: 'Samsung'
    }
  ];

  // Handle product click
  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  // Initialize shop info and products
  useEffect(() => {
    if (shopId) {
      setShopInfo(getShopInfo(shopId));
      const products = getShopProducts(shopId);
      setFilteredProducts(products);
      setRecentlyViewed(demoRecentlyViewed);
    }
  }, [shopId]);

  // Apply filters
  useEffect(() => {
    if (!shopId) return;
    
    let products = getShopProducts(shopId);
    
    // Apply search filter
    if (searchQuery) {
      products = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply category filter
    if (selectedCategory) {
      const category = categories.find(cat => cat.category_id === Number(selectedCategory));
      if (category) {
        products = products.filter(product =>
          product.category.toLowerCase().includes(category.name.toLowerCase())
        );
      }
    }
    
    // Apply brand filter
    if (selectedBrands.length > 0) {
      products = products.filter(product =>
        selectedBrands.some(brandId => {
          const brand = brands.find(b => b.id === Number(brandId));
          return brand && product.brand === brand.name;
        })
      );
    }
    
    // Apply price filter
    products = products.filter(product =>
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );
    
    // Apply sorting
    switch (selectedSort) {
      case 'price_low_high':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price_high_low':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'name_asc':
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        products.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'newest':
      default:
        products.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
    }
    
    setFilteredProducts(products);
    setCurrentPage(1);
  }, [shopId, searchQuery, selectedCategory, selectedBrands, priceRange, selectedSort]);

  // Toggle category expansion
  const toggleCategoryExpand = (categoryId: number) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Render category tree recursively
  const renderCategoryTree = (category: Category, level: number = 0) => {
    const isExpanded = expandedCategories[category.category_id] || false;
    const hasSubcategories = category.children && category.children.length > 0;
    const isSelected = selectedCategory === String(category.category_id);

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
          <div className="space-y-1">
            {category.children.map(child => renderCategoryTree(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Filter functions
  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const resetFilters = () => {
    setSelectedCategory('');
    setSelectedBrands([]);
    setPriceRange([0, 100000]);
    setSearchQuery('');
  };

  const handleSort = (value: string) => {
    setSelectedSort(value);
    setIsSortOpen(false);
  };

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Mobile components
  const MobileFilterSidebar = () => (
    <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-lg transform ${isFilterOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:hidden`}>
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Filters</h3>
          <button onClick={() => setIsFilterOpen(false)}>
            <X size={24} />
          </button>
        </div>
      </div>
      
      <div className="p-4 space-y-6 overflow-y-auto">
        {/* Categories */}
        <div>
          <h4 className="font-semibold mb-3">Categories</h4>
          <div className="space-y-1">
            {categories.map(category => renderCategoryTree(category))}
          </div>
        </div>
        
        {/* Brands */}
        <div>
          <h4 className="font-semibold mb-3">Brands</h4>
          <div className="flex flex-wrap gap-2">
            {brands.map((brand) => {
              const isSelected = selectedBrands.includes(String(brand.id));
              return (
                <button
                  key={brand.id}
                  onClick={() => toggleBrand(String(brand.id))}
                  className={`px-3 py-1.5 rounded-full border text-xs transition-colors ${
                    isSelected
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-gray-100 border-gray-200 text-black hover:border-orange-500'
                  }`}
                >
                  {brand.name}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Price Range */}
        <div>
          <h4 className="font-semibold mb-3">Price Range</h4>
          <div className="px-2">
            <div className="flex justify-between text-xs text-gray-700 mb-2">
              <span>₹{priceRange[0]}</span>
              <span>₹{priceRange[1]}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100000"
              step="1000"
              value={priceRange[1]}
              onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value)])}
              className="w-full"
            />
          </div>
        </div>
        
        <button
          onClick={resetFilters}
          className="w-full px-4 py-2 text-orange-500 border border-orange-500 rounded hover:bg-orange-50"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );

  const MobileSortDropdown = () => (
    <div className={`fixed inset-0 z-50 ${isSortOpen ? 'block' : 'hidden'} md:hidden`}>
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsSortOpen(false)}></div>
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Sort By</h3>
        <div className="space-y-2">
          {[
            { value: 'newest', label: 'Newest First' },
            { value: 'oldest', label: 'Oldest First' },
            { value: 'price_low_high', label: 'Price: Low to High' },
            { value: 'price_high_low', label: 'Price: High to Low' },
            { value: 'name_asc', label: 'Name: A to Z' },
            { value: 'name_desc', label: 'Name: Z to A' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => handleSort(option.value)}
              className={`w-full text-left p-3 rounded ${
                selectedSort === option.value ? 'bg-orange-100 text-orange-600' : 'hover:bg-gray-100'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-4">
        {/* Breadcrumb */}
        <div className="text-xs text-gray-500 mb-4">
          <Link to="/" className="hover:text-orange-500">Home</Link> / 
          <Link to="/all-products" className="hover:text-orange-500"> Products</Link> / 
          <span> {shopInfo?.name}</span>
        </div>
        
        {/* Shop Header */}
        {shopInfo && (
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{shopInfo.name}</h1>
                <p className="text-gray-600 mb-3">{shopInfo.description}</p>
                <div className="flex items-center space-x-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    Open Now
                  </span>
                  <span className="text-sm text-gray-600">
                    {shopInfo.openingTime} - {shopInfo.closingTime}
                  </span>
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <span className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-orange-500 text-white">
                  {shopInfo.category}
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Category Sidebar - Hidden on mobile */}
          <aside className="hidden md:block w-64 pr-4 border-r border-gray-100">
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
                {brands.map((brand) => {
                  const isSelected = selectedBrands.includes(String(brand.id));
                  return (
                    <button
                      key={brand.id}
                      onClick={() => toggleBrand(String(brand.id))}
                      className={`px-3 py-1.5 rounded-full border text-xs font-normal transition-colors focus:outline-none ${
                        isSelected
                          ? 'bg-[#F2631F] text-white border-[#F2631F] shadow'
                          : 'bg-gray-100 border-gray-200 text-black hover:border-[#F2631F] hover:text-[#F2631F]'
                      }`}
                    >
                      {brand.name}
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
                      style={{ width: `${(priceRange[1] / 100000) * 100}%` }}
                    ></div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    step="1000"
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
            {/* Mobile Filter and Sort Bar */}
            <div className="md:hidden flex items-center gap-2 mb-4">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg"
              >
                <SlidersHorizontal size={20} />
                <span>Filters</span>
              </button>
              <button
                onClick={() => setIsSortOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg"
              >
                <ArrowUpDown size={20} />
                <span>Sort</span>
              </button>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search products in ${shopInfo?.name || 'this shop'}...`}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Desktop Sort Dropdown */}
            <div className="hidden md:flex justify-between items-center mb-4">
              <p className="text-sm text-gray-600">
                Showing {currentProducts.length} of {filteredProducts.length} products
              </p>
              <div className="flex items-center">
                <label htmlFor="sort" className="mr-2 text-gray-600 text-sm">Sort by:</label>
                <select
                  id="sort"
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="border border-gray-300 rounded-md py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm bg-white"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price_low_high">Price: Low to High</option>
                  <option value="price_high_low">Price: High to Low</option>
                  <option value="name_asc">Name: A to Z</option>
                  <option value="name_desc">Name: Z to A</option>
                </select>
              </div>
            </div>

            {/* Products Count Mobile */}
            <div className="md:hidden mb-4">
              <p className="text-sm text-gray-600">
                Showing {currentProducts.length} of {filteredProducts.length} products
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {currentProducts.map((product) => (
                <div 
                  key={product.id}
                  onClick={() => handleProductClick(product.id)}
                  className="cursor-pointer"
                >
                  <ProductCard 
                    product={product}
                    isNew={product.isNew}
                    isBuiltIn={product.isBuiltIn}
                  />
                </div>
              ))}
            </div>
            
            {/* No Products Message */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m13-8l-4 4m0 0l-4-4m4 4V3" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your filters or search terms.</p>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                >
                  Clear Filters
                </button>
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-1 my-6">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 flex items-center justify-center border rounded ${
                      currentPage === i + 1
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filter Sidebar */}
        <MobileFilterSidebar />
        
        {/* Mobile Sort Dropdown */}
        <MobileSortDropdown />

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
                  onClick={() => handleProductClick(product.id)}
                  className="cursor-pointer"
                >
                  <ProductCard
                    product={product}
                    isNew={product.isNew}
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

export default ShopProducts; 