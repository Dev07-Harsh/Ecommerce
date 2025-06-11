import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Currency formatter for INR
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

interface CartSummaryProps {
  subtotal: number;
  total: number;
  onCheckout: () => void;
  onApplyPromo: (code: string) => Promise<void>;
  loading?: boolean;
}

const CartSummary: React.FC<CartSummaryProps> = ({
  subtotal,
  total,
  onCheckout,
  onApplyPromo,
  loading = false
}) => {
  const [isPromoOpen, setIsPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      toast.error('Please enter a promo code');
      return;
    }

    setIsApplyingPromo(true);
    try {
      await onApplyPromo(promoCode);
      setPromoCode('');
    } catch (error) {
      toast.error('Failed to apply promo code');
    } finally {
      setIsApplyingPromo(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg">
      <h2 className="text-xl font-medium mb-6">Your Cart</h2>
      
      <div className="flex justify-between mb-4">
        <p className="text-gray-600">Sub Total</p>
        <p className="font-medium">{formatCurrency(subtotal)}</p>
      </div>
      
      <div className="border-b border-gray-200 pb-3 mb-4">
        <div 
          className="flex items-center justify-between cursor-pointer py-2"
          onClick={() => setIsPromoOpen(!isPromoOpen)}
        >
          <p className="text-gray-600">Apply Promo Code</p>
          <div>
            {isPromoOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
        
        {isPromoOpen && (
          <div className="mt-2 space-y-3">
            <input 
              type="text" 
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Enter promo code" 
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500" 
              disabled={isApplyingPromo}
            />
            <button 
              onClick={handleApplyPromo}
              disabled={isApplyingPromo || loading}
              className="w-full bg-gray-200 text-gray-700 py-2 rounded font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isApplyingPromo ? 'Applying...' : 'Apply'}
            </button>
          </div>
        )}
      </div>
      
      <div className="flex justify-between mb-6">
        <p className="font-medium">Total</p>
        <p className="font-bold">{formatCurrency(total)}</p>
      </div>
      
      <button 
        onClick={onCheckout}
        disabled={loading || total === 0}
        className="w-full bg-orange-500 text-white py-3 rounded font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : 'Payment Process'}
      </button>
    </div>
  );
};

export default CartSummary;