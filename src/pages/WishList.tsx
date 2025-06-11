import React, { useEffect } from 'react';
import ProductCard from '../components/product/ProductCard';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Heart, Loader2, ShoppingBag, ArrowRight } from 'lucide-react';

const WishList: React.FC = () => {
  const { wishlistItems, loading } = useWishlist();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/sign-in');
    }
  }, [isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
          <p className="text-gray-500">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (!wishlistItems.length) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center bg-white rounded-lg shadow-sm p-8 max-w-2xl mx-auto">
          <div className="bg-orange-50 p-4 rounded-full mb-6">
            <Heart className="w-16 h-16 text-orange-500" />
          </div>
          <h2 className="text-2xl font-semibold mb-3">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-8 max-w-md">
            Save your favorite products to your wishlist to keep track of items you love and want to purchase later.
          </p>
          <button
            onClick={() => navigate('/all-products')}
            className="bg-orange-500 text-white px-8 py-3 rounded-md hover:bg-orange-600 transition-all duration-300 flex items-center gap-2 group"
          >
            <ShoppingBag className="w-5 h-5" />
            Browse Products
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold mb-1">My Wishlist</h1>
            <p className="text-gray-500">{wishlistItems.length} {wishlistItems.length === 1 ? 'Item' : 'Items'}</p>
          </div>
          <button
            onClick={() => navigate('/all-products')}
            className="text-orange-500 hover:text-orange-600 flex items-center gap-2 transition-colors"
          >
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <div key={item.wishlist_item_id} className="transform transition-all duration-300 hover:scale-[1.02]">
              <ProductCard
                product={{
                  id: String(item.product_id),
                  name: item.product.name,
                  price: item.product.price,
                  originalPrice: undefined,
                  image: item.product.image_url,
                  primary_image: item.product.image_url,
                  sku: '',
                  stock: item.product.stock,
                  description: '',
                  currency: 'INR',
                  category: '',
                  rating: 0,
                  reviews: 0
                }}
                salePercentage={undefined}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WishList; 