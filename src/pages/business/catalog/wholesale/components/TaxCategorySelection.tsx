import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface TaxCategory {
  id: number;
  name: string;
  tax_rate: number;
  description: string;
}

interface TaxCategorySelectionProps {
  selectedTaxCategoryId: number | null;
  onTaxCategorySelect: (taxCategoryId: number) => void;
  errors?: Record<string, any>;
  productId?: number;
}

const TaxCategorySelection: React.FC<TaxCategorySelectionProps> = ({
  onTaxCategorySelect,
  selectedTaxCategoryId,
  errors,
  productId,
}) => {
  const [taxCategories, setTaxCategories] = useState<TaxCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchTaxCategories();
  }, []);

  const fetchTaxCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/tax-categories`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tax categories');
      }

      const data = await response.json();
      setTaxCategories(data);
    } catch (error) {
      console.error('Error fetching tax categories:', error);
      setError('Failed to load tax categories. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaxCategorySelect = async (categoryId: number) => {
    if (!productId) {
      onTaxCategorySelect(categoryId);
      return;
    }

    try {
      setIsUpdating(true);
      const selectedCategory = taxCategories.find(cat => cat.id === categoryId);
      
      if (!selectedCategory) {
        throw new Error('Selected tax category not found');
      }

      // Update product tax in the database
      const response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/products/${productId}/tax`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tax_rate: selectedCategory.tax_rate
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update product tax');
      }

      // Call the parent's onTaxCategorySelect after successful API update
      onTaxCategorySelect(categoryId);
    } catch (error) {
      console.error('Error updating product tax:', error);
      setError('Failed to update product tax. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center">
          <ExclamationCircleIcon className="h-5 w-5 text-red-400 mr-2" />
          <p className="text-red-700">{error}</p>
        </div>
        <button
          onClick={fetchTaxCategories}
          className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
        >
          Try again
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden shadow-sm">
        {taxCategories.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {taxCategories.map((category) => (
              <div
                key={category.id}
                className={`flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
                  selectedTaxCategoryId === category.id ? 'bg-orange-50' : ''
                } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => !isUpdating && handleTaxCategorySelect(category.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center">
                    <div className={`text-sm font-medium ${
                      selectedTaxCategoryId === category.id ? 'text-orange-700' : 'text-gray-900'
                    }`}>
                      {category.name}
                    </div>
                    {selectedTaxCategoryId === category.id && (
                      <CheckCircleIcon className="h-5 w-5 text-orange-600 ml-2" />
                    )}
                  </div>
                  {category.description && (
                    <div className={`text-xs mt-1 ${
                      selectedTaxCategoryId === category.id ? 'text-orange-600' : 'text-gray-500'
                    }`}>
                      {category.description}
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedTaxCategoryId === category.id
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {category.tax_rate.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ExclamationCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tax categories</h3>
            <p className="mt-1 text-sm text-gray-500">No tax categories are available at the moment.</p>
          </div>
        )}
      </div>
      {errors?.tax_category && (
        <div className="mt-2 flex items-center text-sm text-red-600">
          <ExclamationCircleIcon className="h-5 w-5 mr-1" />
          {errors.tax_category}
        </div>
      )}
    </div>
  );
};

export default TaxCategorySelection;