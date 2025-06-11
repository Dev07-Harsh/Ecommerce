import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Brand {
  brand_id: number;
  name: string;
  slug: string;
  icon_url: string | null;
}

interface BrandSelectionProps {
  categoryId: number;
  selectedBrandId: number | null;
  onBrandSelect: (brandId: number) => void;
  errors?: Record<string, any>; // Keep this prop even if not used yet for consistency
}

const BrandSelection: React.FC<BrandSelectionProps> = ({
  categoryId,
  onBrandSelect,
  selectedBrandId,
  // errors, // Keep errors prop if it might be used later
}) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (categoryId) {
      fetchBrands(categoryId);
    } else {
      setBrands([]);
    }
  }, [categoryId]);

  const fetchBrands = async (categoryId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/brands/categories/${categoryId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch brands');
      }

      const data = await response.json();
      setBrands(data);
    } catch (error) {
      console.error('Error fetching brands:', error);
      setError('Failed to load brands. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 px-4 py-3 border-b rounded-t-lg">
         <h3 className="text-md font-semibold text-gray-800">Select Brand</h3>
      </div>
      {/* Search Input */}
      <div className="relative px-4">
        <div className="absolute inset-y-0 left-0 pl-7 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search brands..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
        />
      </div>

      {/* Brand List */}
      <div className="border rounded-b-lg overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center p-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg mx-4 my-2">
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => categoryId && fetchBrands(categoryId)}
              className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Try again
            </button>
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {searchTerm ? 'No brands found matching your search.' : 'No brands available for this category.'}
          </div>
        ) : (
          <div className="max-h-60 overflow-y-auto divide-y divide-gray-200">
            {filteredBrands.map((brand) => (
              <div
                key={brand.brand_id}
                className={`flex items-center px-4 py-3 hover:bg-gray-100 cursor-pointer ${
                  selectedBrandId === brand.brand_id ? 'bg-orange-100 text-orange-800 font-medium' : 'text-gray-900'
                }`}
                onClick={() => onBrandSelect(brand.brand_id)}
              >
                {brand.icon_url && (
                  <img
                    src={brand.icon_url}
                    alt={brand.name}
                    className="h-8 w-8 rounded-full object-cover mr-3 flex-shrink-0"
                  />
                )}
                <div className="flex-grow">
                  <div className="text-sm">{brand.name}</div>
                  <div className={`text-xs ${selectedBrandId === brand.brand_id ? 'text-orange-600' : 'text-gray-500'}`}>{brand.slug}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandSelection;