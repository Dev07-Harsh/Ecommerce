import React from 'react';
import CartItem from '../components/CartItem';
import CartSummary from '../components/CartSummary';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { CartItem as CartItemType } from '../types';
import { ShoppingCart } from 'lucide-react';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice, loading } = useCart();
  const { accessToken } = useAuth();

  const handleCheckout = () => {
    if (!accessToken) {
      toast.error('Please sign in to proceed with checkout');
      navigate('/signin', { state: { returnUrl: '/cart' } });
      return;
    }
    navigate('/payment');
  };

  const handleApplyPromo = async (code: string) => {
    // TODO: Implement promo code functionality when backend is ready
    toast.error('Promo code functionality coming soon');
  };

  const handleContinueShopping = () => {
    navigate('/all-products');
  };

  const handleUpdateCart = async () => {
    try {
      await clearCart();
      toast.success('Cart updated successfully');
    } catch (error) {
      toast.error('Failed to update cart');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  // Filter out deleted items
  const activeCartItems = cart.filter(item => !item.product.is_deleted);

  return (
    <div className="max-w-7xl mx-auto px-12 py-8">
      <h1 className="text-2xl font-bold mb-8">Your Cart</h1>
      
      {activeCartItems.length === 0 ? (
        <div className="text-center py-12 flex flex-col items-center justify-center">
          <ShoppingCart className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4 text-lg">Your cart is empty</p>
          <button 
            onClick={handleContinueShopping}
            className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600 transition-colors w-full sm:w-auto max-w-xs"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
          <div className="lg:col-span-2 mb-8 lg:mb-0">
            <div className="bg-white rounded-lg p-6">
              {/* Cart header */}
              <div className="hidden md:flex text-sm text-gray-500 mb-2">
                <div className="w-8"></div>
                <div className="flex-1 ml-4">
                  <span className="ml-20">Product</span>
                </div>
                <div className="w-24 text-center">Price</div>
                <div className="w-32 text-center">Qty</div>
                <div className="w-24 text-right">Sub Total</div>
              </div>
              
              {/* Cart items */}
              {activeCartItems.map(item => (
                <CartItem
                  key={item.cart_item_id}
                  id={item.cart_item_id}
                  name={item.product.name}
                  image={item.product.image_url}
                  price={item.product.price}
                  quantity={item.quantity}
                  stock={item.product.stock}
                  onRemove={removeFromCart}
                  onUpdateQuantity={updateQuantity}
                />
              ))}
              
              {/* Cart actions */}
              <div className="flex flex-col sm:flex-row mt-6 gap-4 w-full">
                <button 
                  onClick={handleContinueShopping}
                  className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600 transition-colors w-full sm:w-auto"
                >
                  Continue Shopping
                </button>
                <button 
                  onClick={handleUpdateCart}
                  disabled={loading}
                  className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600 transition-colors w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Updating...' : 'Update Cart'}
                </button>
              </div>
            </div>
          </div>
          
          {/* Cart summary */}
          <div className="lg:col-span-1 sticky top-4">
            <CartSummary
              subtotal={totalPrice}
              shipping={0} // TODO: Implement shipping calculation when backend is ready
              total={totalPrice}
              onCheckout={handleCheckout}
              onApplyPromo={handleApplyPromo}
              loading={loading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;