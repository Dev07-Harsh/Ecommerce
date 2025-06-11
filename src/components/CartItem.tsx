import React, { useState } from 'react';
import { X, Minus, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

// Currency formatter for INR
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

interface CartItemProps {
  id: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
  stock: number;
  onRemove: (id: number) => void;
  onUpdateQuantity: (id: number, quantity: number) => void;
}

const CartItem: React.FC<CartItemProps> = ({
  id,
  name,
  image,
  price,
  quantity,
  stock,
  onRemove,
  onUpdateQuantity
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const { user } = useAuth();
  const isMerchant = user?.role === 'merchant';

  const handleIncrement = async () => {
    if (isMerchant) {
      toast.error('Merchants cannot modify cart items');
      return;
    }

    if (quantity >= stock) {
      toast.error('Maximum stock limit reached');
      return;
    }
    
    setIsUpdating(true);
    try {
      await onUpdateQuantity(id, quantity + 1);
    } catch (error) {
      toast.error('Failed to update quantity');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDecrement = async () => {
    if (isMerchant) {
      toast.error('Merchants cannot modify cart items');
      return;
    }

    if (quantity <= 1) {
      return;
    }
    
    setIsUpdating(true);
    try {
      await onUpdateQuantity(id, quantity - 1);
    } catch (error) {
      toast.error('Failed to update quantity');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (isMerchant) {
      toast.error('Merchants cannot remove cart items');
      return;
    }

    setIsRemoving(true);
    try {
      await onRemove(id);
    } catch (error) {
      toast.error('Failed to remove item');
    } finally {
      setIsRemoving(false);
    }
  };

  // Calculate total price for this item
  const totalPrice = price * quantity;

  // If user is a merchant, render a disabled version of the cart item
  if (isMerchant) {
    return (
      <div className="flex items-center py-4 border-b border-gray-200 opacity-50">
        <div className="p-1 text-gray-400">
          <X size={18} />
        </div>
        
        <div className="flex items-center ml-4 flex-1">
          <div className="h-16 w-16 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
            {image ? (
              <img 
                src={image} 
                alt={name} 
                className="object-cover h-full w-full"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-image.png';
                }}
              />
            ) : (
              <div className="text-gray-400 text-xs text-center p-2">No image</div>
            )}
          </div>
          <div className="ml-4 w-48">
            <p className="text-sm text-gray-600 line-clamp-2">{name}</p>
          </div>
        </div>
        
        <div className="text-gray-700 w-24 text-center">{formatCurrency(price)}</div>
        
        <div className="w-32 flex justify-center">
          <div className="flex items-center border border-gray-300 rounded opacity-50">
            <button disabled className="px-2 py-1 text-gray-600">
              <Minus size={16} />
            </button>
            <input
              type="text"
              value={quantity}
              readOnly
              className="w-10 text-center focus:outline-none text-sm"
            />
            <button disabled className="px-2 py-1 text-gray-600">
              <Plus size={16} />
            </button>
          </div>
        </div>
        
        <div className="text-gray-700 w-24 text-right font-medium">
          {formatCurrency(totalPrice)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center py-4 border-b border-gray-200">
      <button 
        onClick={handleRemove}
        disabled={isRemoving}
        className={`p-1 text-gray-400 hover:text-gray-700 transition-colors ${
          isRemoving ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <X size={18} />
      </button>
      
      <div className="flex items-center ml-4 flex-1">
        <div className="h-16 w-16 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
          {image ? (
            <img 
              src={image} 
              alt={name} 
              className="object-cover h-full w-full"
              onError={(e) => {
                e.currentTarget.src = '/placeholder-image.png';
              }}
            />
          ) : (
            <div className="text-gray-400 text-xs text-center p-2">No image</div>
          )}
        </div>
        <div className="ml-4 w-48">
          <p className="text-sm text-gray-600 line-clamp-2">{name}</p>
        </div>
      </div>
      
      <div className="text-gray-700 w-24 text-center">{formatCurrency(price)}</div>
      
      <div className="w-32 flex justify-center">
        <div className={`flex items-center border border-gray-300 rounded ${
          isUpdating ? 'opacity-50' : ''
        }`}>
          <button 
            onClick={handleDecrement}
            disabled={quantity <= 1 || isUpdating}
            className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Minus size={16} />
          </button>
          <input
            type="text"
            value={quantity}
            readOnly
            className="w-10 text-center focus:outline-none text-sm"
          />
          <button 
            onClick={handleIncrement}
            disabled={quantity >= stock || isUpdating}
            className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
      
      <div className="text-gray-700 w-24 text-right font-medium">
        {formatCurrency(totalPrice)}
      </div>
    </div>
  );
};

export default CartItem;