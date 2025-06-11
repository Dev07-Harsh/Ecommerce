import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { useHorizontalScroll } from '../../hooks/useHorizontalScroll';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { toast } from 'react-hot-toast';

// Product type for promo products from API
export type PromoProduct = {
  product_id: number;
  product_name: string;
  selling_price: number;
  special_price: number | null;
  special_start: string | null;
  special_end: string | null;
  discount_pct: number;
  product_description: string;
  images: string[];
  category: {
    category_id: number;
    name: string;
  };
  brand: {
    brand_id: number;
    name: string;
  };
  placement?: {
    placement_id: number;
    sort_order: number;
    added_at: string;
    expires_at: string | null;
  };
  stock?: {
    stock_qty: number;
  };
};

type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const PromoProducts: React.FC = () => {
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { 
    addToWishlist, 
    removeFromWishlist, 
    isInWishlist, 
    loading: wishlistLoading,
    wishlistItems 
  } = useWishlist();
  const navigate = useNavigate();
  const [itemsPerView, setItemsPerView] = useState(2);
  const [promoProducts, setPromoProducts] = useState<PromoProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdowns, setCountdowns] = useState<Record<number, Countdown>>({});

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

  // Update items per view based on screen size
  useEffect(() => {
    const updateItemsPerView = () => {
      const width = window.innerWidth;
      if (width < 1024) { // lg breakpoint
        setItemsPerView(1);
      } else {
        setItemsPerView(2);
      }
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  // Calculate countdown for a product
  const calculateCountdown = (specialEnd: string): Countdown => {
    const endDate = new Date(specialEnd);
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();

    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  };

  // Update countdowns every second
  useEffect(() => {
    const updateCountdowns = () => {
      const newCountdowns: Record<number, Countdown> = {};
      promoProducts.forEach(product => {
        if (product.special_end) {
          newCountdowns[product.product_id] = calculateCountdown(product.special_end);
        }
      });
      setCountdowns(newCountdowns);
    };

    // Initial update
    updateCountdowns();

    // Update every second
    const interval = setInterval(updateCountdowns, 1000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [promoProducts]);

  // Fetch promo products
  const fetchPromoProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/promo-products/?per_page=12`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch promo products');
      }

      const data = await response.json();
      console.log('API Response:', data);

      if (data.products && Array.isArray(data.products)) {
        console.log('Products array:', data.products);
        setPromoProducts(data.products);
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
      console.error('Error fetching promo products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch promo products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromoProducts();
  }, []);

  const handleAddToCart = async (e: React.MouseEvent, product: PromoProduct) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to cart');
      const returnUrl = encodeURIComponent(window.location.pathname);
      navigate(`/sign-in?returnUrl=${returnUrl}`);
      return;
    }

    // Check if user is a merchant or admin
    if (user?.role === 'merchant' || user?.role === 'admin') {
      toast.error('Merchants and admins cannot add items to cart');
      return;
    }
    
    try {
      await addToCart({
        id: product.product_id,
        name: product.product_name,
        price: product.special_price || product.selling_price,
        originalPrice: product.selling_price,
        image_url: product.images?.[0] || '/placeholder-image.jpg',
        stock: product.stock?.stock_qty || 0,
        sku: product.product_id.toString(),
        is_deleted: false
      }, 1);
      toast.success(`${product.product_name} added to cart`);
    } catch (error) {
      toast.error('Failed to add item to cart');
    }
  };

  const handleWishlist = async (e: React.MouseEvent, product: PromoProduct) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to wishlist');
      const returnUrl = encodeURIComponent(window.location.pathname);
      navigate(`/sign-in?returnUrl=${returnUrl}`);
      return;
    }

    // Check if user is a merchant or admin
    if (user?.role === 'merchant' || user?.role === 'admin') {
      toast.error('Merchants and admins cannot add items to wishlist');
      return;
    }
    
    try {
      const productId = product.product_id;
      const isInWishlistItem = isInWishlist(productId);
      
      if (isInWishlistItem) {
        const wishlistItem = wishlistItems.find(item => item.product_id === productId);
        if (wishlistItem) {
          await removeFromWishlist(wishlistItem.wishlist_item_id);
          toast.success('Product removed from wishlist');
        }
      } else {
        await addToWishlist(productId);
        toast.success('Product added to wishlist');
      }
    } catch (error) {
      console.error('Wishlist error details:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update wishlist');
    }
  };

  // Banner data
  const banner = {
    title: "FASHIONABLE WALLETS",
    subtitle: "BIG GOOD SALE FOR HER",
    tag: "New Product",
    image: "https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1080&q=80"
  };

  if (loading) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Promo Products</h2>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-red-500 mb-4">Error loading promo products: {error}</p>
            <button 
              onClick={fetchPromoProducts}
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
    <section className="py-8">
      <div className="container mx-auto px-4">
        {/* Header with navigation */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Promo Products</h2>
          <div className="flex items-center">
            <Link to="/promo-products" className="text-orange-500 text-sm font-medium mr-4">
              See All
            </Link>
            <div className="flex space-x-2">
              <button 
                onClick={() => scroll('left')}
                className="p-1 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                aria-label="Previous products"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => scroll('right')}
                className="p-1 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                aria-label="Next products"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Promo Products Cards */}
        <div className="relative">
          <div
            ref={containerRef}
            className="flex overflow-x-auto gap-6 mb-10 scrollbar-hide"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onWheel={handleWheel}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            {promoProducts.map((product) => {
              const countdown = product.special_end ? countdowns[product.product_id] : null;
              const discount = product.special_price 
                ? Math.round(((product.selling_price - product.special_price) / product.selling_price) * 100)
                : 0;

              return (
                <div 
                  key={product.product_id} 
                  className="flex-none"
                  style={{ width: `calc(${100 / itemsPerView}% - ${(itemsPerView - 1) * 24 / itemsPerView}px)` }}
                >
                  <div className="bg-white rounded-lg overflow-hidden border border-orange-100 hover:border-orange-300 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row relative h-full">
                    {/* Discount Badge */}
                    <div className="absolute top-2 left-2 z-10">
                      <span className="bg-orange-500 text-white text-xs py-1 px-2 rounded">
                        - {discount}%
                      </span>
                    </div>
                    
                    {/* Wishlist Button */}
                    <button 
                      className={`absolute top-2 right-2 z-10 p-1.5 rounded-full transition-all duration-300 ${
                        isInWishlist(product.product_id) 
                          ? 'text-[#F2631F] bg-white shadow-md' 
                          : 'text-gray-400 hover:text-[#F2631F] hover:bg-white hover:shadow-md'
                      }`}
                      onClick={(e) => handleWishlist(e, product)}
                      disabled={wishlistLoading}
                    >
                      <Heart className={`w-4 h-4 ${isInWishlist(product.product_id) ? 'fill-current' : ''}`} />
                    </button>
                    
                    {/* Product Image */}
                    <div className="md:w-2/5 h-64 md:h-auto relative flex-shrink-0">
                      <img 
                        src={product.images?.[0] || '/placeholder-image.jpg'} 
                        alt={product.product_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Product Details */}
                    <div className="md:w-3/5 p-6 flex flex-col justify-between flex-grow">
                      <div>
                        <h3 className="font-medium text-base mb-2">{product.product_name}</h3>
                        <div className="flex items-baseline mb-4">
                          <span className="text-xl font-bold">${product.special_price?.toFixed(2) || product.selling_price.toFixed(2)}</span>
                          {product.special_price && (
                            <span className="text-sm text-gray-500 line-through ml-3">
                              ${product.selling_price.toFixed(2)}
                            </span>
                          )}
                        </div>
                        
                        {/* Countdown Timer */}
                        {countdown && (
                          <div className="grid grid-cols-4 gap-2 mb-6">
                            <div className="text-center">
                              <div className="bg-gray-100 p-2 rounded">
                                <span className="text-base font-medium">{countdown.days}</span>
                              </div>
                              <span className="text-xs text-gray-500">Day</span>
                            </div>
                            <div className="text-center">
                              <div className="bg-gray-100 p-2 rounded">
                                <span className="text-base font-medium">{countdown.hours}</span>
                              </div>
                              <span className="text-xs text-gray-500">Hour</span>
                            </div>
                            <div className="text-center">
                              <div className="bg-gray-100 p-2 rounded">
                                <span className="text-base font-medium">{countdown.minutes.toString().padStart(2, '0')}</span>
                              </div>
                              <span className="text-xs text-gray-500">Min</span>
                            </div>
                            <div className="text-center">
                              <div className="bg-gray-100 p-2 rounded">
                                <span className="text-base font-medium">{countdown.seconds.toString().padStart(2, '0')}</span>
                              </div>
                              <span className="text-xs text-gray-500">Sec</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Add to Cart Button */}
                      <button 
                        className="w-full bg-[#F2631F] text-white py-3 px-4 rounded transition flex items-center justify-center gap-1.5"
                        onClick={(e) => handleAddToCart(e, product)}
                        disabled={product.stock?.stock_qty === 0 || user?.role === 'merchant' || user?.role === 'admin'}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {product.stock?.stock_qty === 0 ? 'Sold Out' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Full-width Banner */}
        <div className="relative overflow-hidden h-96 w-screen -ml-[calc((100vw-100%)/2)]">
          <img 
            src={banner.image}
            alt="Promo banner" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center p-8">
            <div className="container mx-auto px-4">
              <div className="ml-auto mr-8">
                <span className="inline-block bg-white bg-opacity-90 px-3 py-1 text-sm mb-4">
                  {banner.tag}
                </span>
                <h3 className="text-white text-3xl font-bold mb-2">{banner.title}</h3>
                <h4 className="text-white text-2xl font-bold mb-6">{banner.subtitle}</h4>
                <button className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-6 rounded-md font-medium transition">
                  Order Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoProducts; 