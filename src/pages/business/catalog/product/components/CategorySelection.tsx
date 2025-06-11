import React, { useState, useEffect } from 'react';
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Category {
  category_id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  children?: Category[];
}

interface Brand {
  brand_id: number;
  name: string;
  slug: string;
}

interface CategorySelectionProps {
  onCategorySelect: (categoryId: number) => void;
  selectedCategoryId: number | null;
  onBrandSelect?: (brandId: number) => void;
  selectedBrandId?: number | null;
  errors?: Record<string, any>;
}

const CategorySelection: React.FC<CategorySelectionProps> = ({
  onCategorySelect,
  selectedCategoryId,
  onBrandSelect,
  selectedBrandId,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [breadcrumbs, setBreadcrumbs] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);
  const [brandsError, setBrandsError] = useState<string | null>(null);
  const [showBrandRequestForm, setShowBrandRequestForm] = useState(false);
  const [brandRequest, setBrandRequest] = useState({
    brand_name: '',
    description: '',
  });
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestSuccess, setRequestSuccess] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategoryId) {
      fetchBrandsForCategory(selectedCategoryId);
    } else {
      setBrands([]);
    }
  }, [selectedCategoryId]);

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/categories`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();
      const tree = buildCategoryTree(data);
      setCategories(tree);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBrandsForCategory = async (categoryId: number) => {
    setIsLoadingBrands(true);
    setBrandsError(null);
    try {
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
      setBrandsError('Failed to load brands. Please try again later.');
    } finally {
      setIsLoadingBrands(false);
    }
  };

  const handleBrandRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingRequest(true);
    setRequestError(null);
    setRequestSuccess(false);

    try {
      const response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/brand-requests`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...brandRequest,
          category_id: selectedCategoryId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit brand request');
      }

      setRequestSuccess(true);
      setBrandRequest({
        brand_name: '',
        description: '',
      });
      setShowBrandRequestForm(false);
    } catch (error) {
      console.error('Error submitting brand request:', error);
      setRequestError('Failed to submit brand request. Please try again.');
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const buildCategoryTree = (flatCategories: Category[]): Category[] => {
    const categoryMap = new Map<number, Category>();
    const tree: Category[] = [];

    flatCategories.forEach(category => {
      categoryMap.set(category.category_id, { ...category, children: [] });
    });

    flatCategories.forEach(category => {
      const categoryWithChildren = categoryMap.get(category.category_id)!;
      if (category.parent_id === null) {
        tree.push(categoryWithChildren);
      } else {
        const parent = categoryMap.get(category.parent_id);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(categoryWithChildren);
        }
      }
    });

    return tree;
  };

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const handleCategorySelect = (category: Category) => {
    onCategorySelect(category.category_id);
    updateBreadcrumbs(category);
  };

  const updateBreadcrumbs = (category: Category) => {
    const findPath = (categories: Category[], targetId: number, path: Category[] = []): Category[] | null => {
      for (const cat of categories) {
        if (cat.category_id === targetId) {
          return [...path, cat];
        }
        if (cat.children) {
          const found = findPath(cat.children, targetId, [...path, cat]);
          if (found) return found;
        }
      }
      return null;
    };

    const path = findPath(categories, category.category_id);
    if (path) {
      setBreadcrumbs(path);
    }
  };

  const renderCategoryTree = (categories: Category[], level = 0) => {
    return categories.map(category => (
      <div key={category.category_id}>
        <div
          className={`flex items-center py-2 px-4 hover:bg-gray-100 cursor-pointer ${
            selectedCategoryId === category.category_id ? 'bg-orange-100 text-orange-800 font-medium' : 'text-gray-900'
          }`}
          style={{ paddingLeft: `${level * 1.5 + 1}rem` }}
        >
          {category.children && category.children.length > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); toggleCategory(category.category_id); }}
              className="p-1 hover:bg-gray-200 rounded-full mr-2"
            >
              {expandedCategories.has(category.category_id) ? (
                <ChevronDownIcon className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRightIcon className="h-4 w-4 text-gray-500" />
              )}
            </button>
          )}
          <div
            className={`flex-1 ${!category.children?.length && level === 0 ? 'ml-6' : ''} ${!category.children?.length && level > 0 ? 'ml-1' : ''}`} // Adjusted margin for items without children
            onClick={() => handleCategorySelect(category)}
          >
            <span className="text-sm">{category.name}</span>
          </div>
        </div>
        {expandedCategories.has(category.category_id) && category.children && (
          <div>{renderCategoryTree(category.children, level + 1)}</div>
        )}
      </div>
    ));
  };

  const renderBrandRequestForm = () => (
    <div className="p-4 border-t">
      <form onSubmit={handleBrandRequest} className="space-y-4">
        <div>
          <label htmlFor="brand_name" className="block text-sm font-medium text-gray-700">
            Brand Name
          </label>
          <input
            type="text"
            id="brand_name"
            value={brandRequest.brand_name}
            onChange={(e) => setBrandRequest(prev => ({ ...prev, brand_name: e.target.value }))}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 sm:text-sm p-2"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={brandRequest.description}
            onChange={(e) => setBrandRequest(prev => ({ ...prev, description: e.target.value }))}
            required
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 sm:text-sm p-2"
          />
        </div>
        {requestError && (
          <div className="text-red-600 text-sm">{requestError}</div>
        )}
        {requestSuccess && (
          <div className="text-green-600 text-sm">Brand request submitted successfully.</div>
        )}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => setShowBrandRequestForm(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmittingRequest}
            className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            {isSubmittingRequest ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">{error}</p>
        <button
          onClick={fetchCategories}
          className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <div className="flex items-center space-x-1 text-sm text-gray-500 p-2 bg-gray-50 rounded-md">
          {breadcrumbs.map((category, index) => (
            <React.Fragment key={category.category_id}>
              <span
                className="hover:text-primary-600 cursor-pointer px-2 py-1 rounded hover:bg-gray-200"
                onClick={() => handleCategorySelect(category)}
              >
                {category.name}
              </span>
              {index < breadcrumbs.length - 1 && (
                <ChevronRightIcon className="h-4 w-4 text-gray-400" />
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Category Tree */}
      <div className="border rounded-lg overflow-hidden shadow-sm">
        <div className="bg-gray-50 px-4 py-3 border-b">
             <h3 className="text-md font-semibold text-gray-800">Select Category</h3>
        </div>
        {categories.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No categories available
          </div>
        ) : (
          <div className="max-h-72 overflow-y-auto">
            {renderCategoryTree(categories)}
          </div>
        )}
      </div>

      {/* Brands Section */}
      {selectedCategoryId && (
        <div className="border rounded-lg overflow-hidden shadow-sm">
          <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
            <h3 className="text-md font-semibold text-gray-800">Associated Brands</h3>
            {!showBrandRequestForm && !isLoadingBrands && !brandsError && (
              <button
                onClick={() => setShowBrandRequestForm(true)}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                Request Brand
              </button>
            )}
          </div>
          {isLoadingBrands ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
            </div>
          ) : brandsError ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{brandsError}</p>
              <button
                onClick={() => selectedCategoryId && fetchBrandsForCategory(selectedCategoryId)}
                className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Try again
              </button>
            </div>
          ) : showBrandRequestForm ? (
            renderBrandRequestForm()
          ) : (
            <div className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
              {brands.map((brand) => (
                <div
                  key={brand.brand_id}
                  onClick={() => onBrandSelect?.(brand.brand_id)}
                  className={`px-4 py-3 hover:bg-gray-100 cursor-pointer ${ selectedBrandId === brand.brand_id ? 'bg-orange-100 text-orange-800 font-medium' : 'text-gray-900' }`}
                >
                  <span className="text-sm">{brand.name}</span>
                </div>
              ))}
              {brands.length === 0 && !showBrandRequestForm && (
                <div className="p-6 text-center text-gray-500">
                  <p>No brands available for this category.</p>
                  <button
                    onClick={() => setShowBrandRequestForm(true)}
                    className="mt-2 text-orange-600 hover:text-orange-700 text-sm font-medium"
                  >
                    Request to add a brand
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategorySelection;