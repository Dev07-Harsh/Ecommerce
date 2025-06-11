import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { PlusIcon, TrashIcon, EyeIcon, StarIcon as SolidStarIcon, ShoppingBagIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { StarIcon as OutlineStarIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'; 

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface MerchantProduct {
  product_id: number;
  name: string;
}

interface ProductPlacement {
  placement_id: number;
  product_id: number;
  merchant_id: number;
  placement_type: 'featured' | 'promoted';
  sort_order: number;
  is_active: boolean;
  expires_at: string | null;
  added_at: string;
  product_details: {
    product_id: number;
    product_name: string;
    original_price?: number;
    promotional_price?: number;
    special_start?: string;
    special_end?: string;
  };
}

interface SubscriptionStatus {
  is_subscribed: boolean;
  can_place_premium: boolean;
  subscription_started_at: string | null;
  subscription_expires_at: string | null;
  plan: {
    plan_id: number;
    name: string;
    description: string;
    featured_limit: number;
    promo_limit: number;
    duration_days: number;
    price: number;
    can_place_premium: boolean;
  } | null;
}

const ProductPlacements: React.FC = () => {
  const { accessToken, user } = useAuth();
  
  // State for subscription status
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(true);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);

  const [placements, setPlacements] = useState<ProductPlacement[]>([]);
  const [merchantProducts, setMerchantProducts] = useState<MerchantProduct[]>([]);
  
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const [selectedPlacementTypeToAdd, setSelectedPlacementTypeToAdd] = useState<'FEATURED' | 'PROMOTED'>('FEATURED');
  const [selectedProductIdToAdd, setSelectedProductIdToAdd] = useState<string>('');
  const [sortOrderToAdd, setSortOrderToAdd] = useState<number>(0);

  const [filterType, setFilterType] = useState<'ALL' | 'FEATURED' | 'PROMOTED'>('ALL');
  
  const PLACEMENT_LIMIT = 10;

  const [promotionalPrice, setPromotionalPrice] = useState<string>('');
  const [specialStartDate, setSpecialStartDate] = useState<string>('');
  const [specialEndDate, setSpecialEndDate] = useState<string>('');

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (!accessToken || !user) {
        setIsSubscriptionLoading(false);
        setSubscriptionError("User not authenticated.");
        return;
      }
      setIsSubscriptionLoading(true);
      setSubscriptionError(null);
      try {
        console.log('Fetching subscription status...');
        const response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/subscription/current`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Subscription status error:', errorData);
          throw new Error(errorData.message || `Failed to fetch subscription status (${response.status})`);
        }
        
        const statusData = await response.json();
        console.log('Subscription status received:', statusData);
        setSubscriptionStatus(statusData);
      } catch (error) {
        console.error("Error fetching subscription status:", error);
        setSubscriptionError(error instanceof Error ? error.message : 'Could not load subscription status.');
        toast.error(error instanceof Error ? error.message : 'Could not load subscription status.');
      } finally {
        setIsSubscriptionLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, [accessToken, user]);

  const fetchData = useCallback(async () => {
    if (!accessToken) return;
    setIsLoadingData(true);
    try {
      // Fetch merchant products
      const productsResponse = await fetch(`${API_BASE_URL}/api/merchant-dashboard/products`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      if (!productsResponse.ok) throw new Error('Failed to fetch merchant products');
      const productsData = await productsResponse.json();
      setMerchantProducts(productsData.map((p: any) => ({ product_id: p.product_id, name: p.product_name })));

      // Fetch current placements
      const placementsResponse = await fetch(`${API_BASE_URL}/api/merchant-dashboard/product-placements`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      if (!placementsResponse.ok) throw new Error('Failed to fetch product placements');
      const placementsData = await placementsResponse.json();
      setPlacements(placementsData);

    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(error instanceof Error ? error.message : 'Failed to load product data.');
    } finally {
      setIsLoadingData(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!isSubscriptionLoading && !subscriptionError) {
      fetchData();
    }
  }, [fetchData, isSubscriptionLoading, subscriptionError]);

  const canPlacePremium = useMemo(() => {
    console.log('Current subscription status:', subscriptionStatus);
    return subscriptionStatus?.can_place_premium === true;
  }, [subscriptionStatus]);

  const handleAddPlacement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductIdToAdd) {
      toast.error('Please select a product.');
      return;
    }
    if (!canPlacePremium) {
      toast.error('Your subscription does not allow adding premium placements.');
      return;
    }

    // Validate promotional data for promoted products
    if (selectedPlacementTypeToAdd === 'PROMOTED') {
      if (!promotionalPrice || isNaN(parseFloat(promotionalPrice)) || parseFloat(promotionalPrice) <= 0) {
        toast.error('Please enter a valid promotional price.');
        return;
      }
      if (!specialStartDate || !specialEndDate) {
        toast.error('Please select both start and end dates for the promotion.');
        return;
      }
      
      const startDate = new Date(specialStartDate);
      const endDate = new Date(specialEndDate);
      const today = new Date();
      
      // Set today's time to start of day for comparison
      today.setHours(0, 0, 0, 0);
      startDate.setHours(0, 0, 0, 0);
      
      if (startDate < today) {
        toast.error('Promotion start date cannot be in the past.');
        return;
      }
      if (endDate <= startDate) {
        toast.error('Promotion end date must be after the start date.');
        return;
      }
      if (endDate > new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000))) {
        toast.error('Promotion cannot last more than 30 days.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/product-placements`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: parseInt(selectedProductIdToAdd),
          placement_type: selectedPlacementTypeToAdd,
          sort_order: sortOrderToAdd,
          promotional_price: selectedPlacementTypeToAdd === 'PROMOTED' ? parseFloat(promotionalPrice) : undefined,
          special_start: selectedPlacementTypeToAdd === 'PROMOTED' ? specialStartDate : undefined,
          special_end: selectedPlacementTypeToAdd === 'PROMOTED' ? specialEndDate : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add placement');
      }

      toast.success('Product placement added successfully!');
      setSelectedProductIdToAdd('');
      setSortOrderToAdd(0);
      setPromotionalPrice('');
      setSpecialStartDate('');
      setSpecialEndDate('');
      await fetchData();
    } catch (error) {
      console.error("Error adding placement:", error);
      toast.error(error instanceof Error ? error.message : 'Failed to add placement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePlacement = async (placementId: number) => {
    if (!window.confirm('Are you sure you want to remove this product placement?')) return;
    
    setIsDeleting(placementId);
    try {
      const response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/product-placements/${placementId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (response.status !== 204 && !response.ok ) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to delete placement');
      }
      
      toast.success('Product placement removed successfully!');
      await fetchData();
    } catch (error) {
      console.error("Error deleting placement:", error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete placement.');
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredPlacements = useMemo(() => {
    if (filterType === 'ALL') return placements;
    return placements.filter(p => p.placement_type.toUpperCase() === filterType);
  }, [placements, filterType]);

  const getSlotInfo = useCallback((type: 'featured' | 'promoted') => {
    const count = placements.filter(p => p.placement_type === type).length;
    return {
      used: count,
      remaining: PLACEMENT_LIMIT - count,
      limitReached: count >= PLACEMENT_LIMIT,
    };
  }, [placements]);

  const featuredSlots = getSlotInfo('featured');
  const promotedSlots = getSlotInfo('promoted');
  
  const currentSlotsInfo = selectedPlacementTypeToAdd === 'FEATURED' ? featuredSlots : promotedSlots;

  if (isSubscriptionLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-500"></div>
        <p className="ml-3 text-gray-600">Loading subscription status...</p>
      </div>
    );
  }
  
  if (subscriptionError) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-700 font-medium">Could not load subscription status.</p>
        <p className="text-red-600 text-sm mt-1">{subscriptionError}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Manage Featured & Promoted Products</h1>

      <div className="bg-white p-6 rounded-lg shadow-md border border-orange-200">
        <h2 className="text-xl font-semibold text-gray-700 mb-1">Add Product to Placement</h2>
        
        {!canPlacePremium && (
          <div className="mt-4 p-3 bg-orange-50 text-orange-700 border border-orange-200 rounded-md text-sm">
            <p>
              <OutlineStarIcon className="h-5 w-5 inline-block mr-2 text-orange-500" />
              {subscriptionStatus?.is_subscribed 
                ? "Your current subscription plan doesn't include premium placements."
                : "You need an active subscription to use premium placements."}
              {' '}
              <a href="/business/subscription" className="font-medium underline hover:text-orange-800">
                {subscriptionStatus?.is_subscribed ? 'Upgrade your plan' : 'Subscribe now'}
              </a>
            </p>
          </div>
        )}

        <form onSubmit={handleAddPlacement} className="space-y-4 mt-4 max-w-xl">
          <div>
            <label htmlFor="placementTypeToAdd" className="block text-sm font-medium text-gray-700 mb-1">Placement Type</label>
            <div className="relative">
                <select
                id="placementTypeToAdd"
                value={selectedPlacementTypeToAdd}
                onChange={(e) => setSelectedPlacementTypeToAdd(e.target.value as 'FEATURED' | 'PROMOTED')}
                className="w-full p-2 pr-8 border border-gray-300 rounded-md shadow-sm focus:ring-accent-500 focus:border-accent-500 appearance-none"
                disabled={!canPlacePremium || isSubmitting}
                >
                <option value="FEATURED">Featured</option>
                <option value="PROMOTED">Promoted</option>
                </select>
                <ChevronDownIcon className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label htmlFor="productSelectToAdd" className="block text-sm font-medium text-gray-700 mb-1">Product</label>
            <div className="relative">
                <select
                id="productSelectToAdd"
                value={selectedProductIdToAdd}
                onChange={(e) => setSelectedProductIdToAdd(e.target.value)}
                className="w-full p-2 pr-8 border border-gray-300 rounded-md shadow-sm focus:ring-accent-500 focus:border-accent-500 appearance-none truncate"
                disabled={!canPlacePremium || isSubmitting || currentSlotsInfo.limitReached}
                >
                <option value="">-- Select a Product --</option>
                {merchantProducts.map(product => (
                    <option key={product.product_id} value={product.product_id} title={product.name}>
                    {product.name}
                    </option>
                ))}
                </select>
                <ChevronDownIcon className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
             {merchantProducts.length === 0 && !isLoadingData && (
                <p className="text-xs text-gray-500 mt-1">You have no products to add.</p>
            )}
          </div>

          {selectedPlacementTypeToAdd === 'PROMOTED' && (
            <>
              <div>
                <label htmlFor="promotionalPrice" className="block text-sm font-medium text-gray-700 mb-1">
                  Promotional Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    id="promotionalPrice"
                    value={promotionalPrice}
                    onChange={(e) => setPromotionalPrice(e.target.value)}
                    min="0.01"
                    step="0.01"
                    className="w-full pl-8 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-accent-500 focus:border-accent-500"
                    placeholder="0.00"
                    disabled={!canPlacePremium || isSubmitting || currentSlotsInfo.limitReached}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Enter the special promotional price for this product.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="specialStartDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Promotion Start Date
                  </label>
                  <input
                    type="date"
                    id="specialStartDate"
                    value={specialStartDate}
                    onChange={(e) => setSpecialStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-accent-500 focus:border-accent-500"
                    disabled={!canPlacePremium || isSubmitting || currentSlotsInfo.limitReached}
                  />
                  <p className="text-xs text-gray-500 mt-1">When should the promotion start? (Can start today)</p>
                </div>

                <div>
                  <label htmlFor="specialEndDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Promotion End Date
                  </label>
                  <input
                    type="date"
                    id="specialEndDate"
                    value={specialEndDate}
                    onChange={(e) => setSpecialEndDate(e.target.value)}
                    min={specialStartDate || new Date().toISOString().split('T')[0]}
                    max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-accent-500 focus:border-accent-500"
                    disabled={!canPlacePremium || isSubmitting || currentSlotsInfo.limitReached}
                  />
                  <p className="text-xs text-gray-500 mt-1">When should the promotion end? (max 30 days)</p>
                </div>
              </div>
            </>
          )}

          <div>
            <label htmlFor="sortOrderToAdd" className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
            <input
              type="number"
              id="sortOrderToAdd"
              value={sortOrderToAdd}
              onChange={(e) => setSortOrderToAdd(parseInt(e.target.value) || 0)}
              min="0"
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-accent-500 focus:border-accent-500"
              disabled={!canPlacePremium || isSubmitting || currentSlotsInfo.limitReached}
            />
            <p className="text-xs text-gray-500 mt-1">Lower numbers appear first. Default is 0.</p>
          </div>

          <div className="text-sm text-gray-600 p-3 bg-orange-50 rounded-md border border-orange-100">
            <p>Slots for <span className="font-medium">{selectedPlacementTypeToAdd.toLowerCase()}</span>: <span className="font-semibold">{currentSlotsInfo.used} / {PLACEMENT_LIMIT}</span></p>
            <p className={`font-semibold ${currentSlotsInfo.remaining > 0 ? 'text-green-600' : 'text-red-600'}`}>
              Remaining Slots: {currentSlotsInfo.remaining}
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-accent-500 hover:bg-accent-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            disabled={!canPlacePremium || isSubmitting || !selectedProductIdToAdd || currentSlotsInfo.limitReached}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding...
              </>
            ) : (
              <>
                <PlusIcon className="h-5 w-5 mr-2"/> Add to {selectedPlacementTypeToAdd.toLowerCase()}
              </>
            )}
          </button>
          {currentSlotsInfo.limitReached && canPlacePremium && (
            <p className="text-xs text-red-600 mt-2 text-center">
                Slot limit reached for {selectedPlacementTypeToAdd.toLowerCase()} products.
            </p>
          )}
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border border-orange-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700 mb-2 sm:mb-0">Your Current Placements</h2>
          <div className="w-full sm:w-auto relative">
            <select
              id="filterPlacementType"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'ALL' | 'FEATURED' | 'PROMOTED')}
              className="w-full sm:w-auto p-2 pr-8 border border-gray-300 rounded-md shadow-sm focus:ring-accent-500 focus:border-accent-500 appearance-none"
            >
              <option value="ALL">All Placements</option>
              <option value="FEATURED">Featured Only</option>
              <option value="PROMOTED">Promoted Only</option>
            </select>
            <ChevronDownIcon className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {isLoadingData && placements.length === 0 ? (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent-500"></div>
                <p className="ml-3 text-gray-600">Loading placements...</p>
            </div>
        ) : !isLoadingData && filteredPlacements.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ShoppingBagIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>No products found for the selected filter.</p>
            {filterType === 'ALL' && <p className="text-sm">Try adding a product to a placement using the form above.</p>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-orange-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Sort Order</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Added</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Promotion Period</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPlacements.map(placement => (
                  <tr key={placement.placement_id} className="hover:bg-orange-50/50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 mr-3 rounded-md bg-orange-100 flex items-center justify-center text-orange-500">
                            <SolidStarIcon className="h-5 w-5" />
                        </div>
                        <div className="text-sm font-medium text-gray-900">{placement.product_details?.product_name || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        placement.placement_type === 'featured' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {placement.placement_type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {placement.placement_type === 'promoted' && placement.product_details?.promotional_price ? (
                        <div className="text-sm">
                          <span className="text-gray-500 line-through">${placement.product_details.original_price?.toFixed(2)}</span>
                          <span className="ml-2 text-red-600 font-semibold">${placement.product_details.promotional_price.toFixed(2)}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">${placement.product_details?.original_price?.toFixed(2) || 'N/A'}</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{placement.sort_order}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(placement.added_at).toLocaleDateString()}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {placement.placement_type === 'promoted' && placement.product_details?.special_start && placement.product_details?.special_end ? (
                        <div>
                          <div className="text-gray-600">
                            {new Date(placement.product_details.special_start).toLocaleDateString()} - {new Date(placement.product_details.special_end).toLocaleDateString()}
                          </div>
                          {new Date(placement.product_details.special_end) > new Date() && (
                            <div className="text-xs text-red-600">
                              {Math.ceil((new Date(placement.product_details.special_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                            </div>
                          )}
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDeletePlacement(placement.placement_id)}
                        className="text-red-500 hover:text-red-700 disabled:opacity-50 p-1 rounded-full hover:bg-red-50"
                        disabled={isDeleting === placement.placement_id}
                        title="Delete Placement"
                      >
                        {isDeleting === placement.placement_id ? (
                          <svg className="animate-spin h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <TrashIcon className="h-5 w-5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPlacements;