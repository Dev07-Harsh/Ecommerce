import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';

interface OrderSummaryProps {
  className?: string;
  selectedCountry?: {
    code: string;
    name: string;
  };
}

interface ExchangeRates {
  [key: string]: number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ className = '', selectedCountry }) => {
  const { cart, totalPrice, totalItems } = useCart();
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter out deleted items
  const activeCartItems = cart.filter(item => !item.is_deleted);

  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '');
        const response = await fetch(`${baseUrl}/api/exchange-rates`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch exchange rates');
        }
        
        const data = await response.json();
        setExchangeRates(data.conversion_rates);
      } catch (err) {
        console.error('Error fetching exchange rates:', err);
        setError('Failed to load currency conversion rates');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExchangeRates();
  }, []);

  // Format price based on country with currency conversion
  const formatPrice = (price: number) => {
    if (isLoading) {
      return 'Loading...';
    }

    if (error) {
      return 'Error loading rates';
    }

    const currencyMap: { [key: string]: string } = {
      'US': 'USD',
      'GB': 'GBP',
      'IN': 'INR',
      'EU': 'EUR',
      'CA': 'CAD',
      'AU': 'AUD',
      'JP': 'JPY',
      'CN': 'CNY',
      'SG': 'SGD',
      'AE': 'AED',
      'SA': 'SAR',
      'NZ': 'NZD',
      'SE': 'SEK',
      'DE': 'EUR',
      'FR': 'EUR',
      'IT': 'EUR',
      'ES': 'EUR',
      'RU': 'RUB',
      'BR': 'BRL',
      'ZA': 'ZAR',
      'MX': 'MXN',
    };

    const currency = currencyMap[selectedCountry?.code || 'IN'] || 'INR';
    const rate = exchangeRates[currency] || 1;
    const convertedPrice = price * rate;

    const currencySymbols: { [key: string]: string } = {
      'USD': '$',
      'GBP': '£',
      'INR': '₹',
      'EUR': '€',
      'CAD': 'C$',
      'AUD': 'A$',
      'JPY': '¥',
      'CNY': '¥',
      'SGD': 'S$',
      'AED': 'د.إ',
      'SAR': '﷼',
      'NZD': 'NZ$',
      'SEK': 'kr',
      'RUB': '₽',
      'BRL': 'R$',
      'ZAR': 'R',
      'MXN': 'Mex$',
    };

    const symbol = currencySymbols[currency] || currency;

    return `${symbol}${convertedPrice.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  if (isLoading) {
    return (
      <div className={`w-full lg:w-[400px] bg-white rounded-lg p-8 h-fit ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4 mt-2"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`w-full lg:w-[400px] bg-white rounded-lg p-8 h-fit ${className}`}>
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className={`w-full lg:w-[400px] bg-white rounded-lg p-8 h-fit ${className}`}>
      <h2 className="text-lg font-semibold mb-6">Your Order</h2>
      <div className="space-y-4 mb-6">
        {activeCartItems.map((item) => (
          <div key={item.cart_item_id} className="flex items-center gap-4">
            <img 
              src={item.product.image_url} 
              alt={item.product.name} 
              className="w-16 h-16 rounded object-cover"
            />
            <div className="flex-1">
              <div className="font-medium text-sm">{item.product.name}</div>
              <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
            </div>
            <div className="font-medium text-sm">
              {formatPrice(item.product.price * item.quantity)}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Subtotal ({totalItems} items)</span>
          <span>{formatPrice(totalPrice)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Shipping</span>
          <span>Calculated at next step</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Tax</span>
          <span>Calculated at next step</span>
        </div>
        <div className="flex justify-between font-semibold pt-2 border-t">
          <span>Total</span>
          <span>{formatPrice(totalPrice)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary; 