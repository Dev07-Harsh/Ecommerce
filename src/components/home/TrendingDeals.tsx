import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../product/ProductCard';
import { useHorizontalScroll } from '../../hooks/useHorizontalScroll';
import { Product } from '../../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const TrendingDeals: React.FC = () => {
  const [itemsPerView, setItemsPerView] = useState(4);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    containerRef,
    isDragging,
    handleMouseDown,
    handleMouseUp,
    handleMouseMove,
    handleTouchStart,
    handleTouchMove,
    handleWheel,
    scroll
  } = useHorizontalScroll();

  // Fetch trending deals
  const fetchTrendingDeals = async () => {
    try {
      setLoading(true);
      console.log('Fetching trending deals from:', `${API_BASE_URL}/api/products/trendy-deals`);
      
      const response = await fetch(`${API_BASE_URL}/api/products/trendy-deals`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error('API Response Status:', response.status);
        console.error('API Response Status Text:', response.statusText);
        throw new Error(`Failed to fetch trending deals: ${response.status}`);
      }

      const data = await response.json();
      console.log('=== API Response Debug ===');
      console.log('Full API Response:', data);
      console.log('Response Type:', typeof data);
      console.log('Response Keys:', Object.keys(data));
      console.log('Products Array:', data.products);
      console.log('First Product Sample:', data.products?.[0]);
      console.log('Products Length:', data.products?.length);
      console.log('========================');

      if (data.products && Array.isArray(data.products)) {
        setProducts(data.products);
        setError(null);
      } else {
        console.error('Invalid data structure:', {
          hasProducts: Boolean(data.products),
          isProductsArray: Array.isArray(data.products),
          dataType: typeof data.products,
          dataKeys: Object.keys(data)
        });
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching trending deals:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch trending deals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingDeals();
  }, []);

  // Update items per view based on screen size
  useEffect(() => {
    const updateItemsPerView = () => {
      const width = window.innerWidth;
      if (width < 640) { // sm breakpoint
        setItemsPerView(1);
      } else if (width < 768) { // md breakpoint
        setItemsPerView(2);
      } else if (width < 1024) { // lg breakpoint
        setItemsPerView(3);
      } else {
        setItemsPerView(4);
      }
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  if (loading) {
    return (
      <section className="pb-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="pb-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-red-500 mb-4">Error loading trending deals: {error}</p>
            <button 
              onClick={fetchTrendingDeals}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pb-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col space-y-6">
          {/* Header with navigation */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <h2 className="text-2xl font-semibold">Trending Deals</h2>
            
            {/* Navigation */}
            <div className="flex items-center w-full md:w-auto space-x-4">
              <Link to="/trending" className="text-orange-500 text-sm hover:underline">
                See all
              </Link>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => scroll('left')}
                  className="p-1 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                  aria-label="Previous deals"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => scroll('right')}
                  className="p-1 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                  aria-label="Next deals"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Products carousel */}
          <div className="relative">
            <div
              ref={containerRef}
              className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide"
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onMouseMove={handleMouseMove}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onWheel={handleWheel}
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
              {products.map((product) => (
                <div 
                  key={product.id} 
                  className="flex-none"
                  style={{ width: `calc(${100 / itemsPerView}% - ${(itemsPerView - 1) * 16 / itemsPerView}px)` }}
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
        </div>
      </div>
    </section>
  );
};

export default TrendingDeals; 