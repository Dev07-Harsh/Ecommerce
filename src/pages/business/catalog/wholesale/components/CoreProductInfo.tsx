import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/outline';
import ProductMediaUpload from './ProductMediaUpload';
import ShippingDetails from './ShippingDetails';
import ProductMeta from './ProductMeta';
import ProductVariants from './ProductVariants';
import AttributeSelection from './AttributeSelection';
import { CheckCircleIcon, ShieldExclamationIcon } from '@heroicons/react/24/solid';
import AddWholesaleProduct from './AddWholesaleProduct';

// Add className constants
const labelClassName = "block text-sm font-medium text-gray-700";
const inputClassName = (hasError: boolean = false) => `mt-1 block w-full rounded-md ${hasError ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm`;
const errorTextClassName = "mt-1 text-sm text-red-600";
const sectionTitleClassName = "text-lg font-medium text-gray-900 mb-4";

interface VariantAttribute {
  name: string;
}

interface Variant {
  variant_id?: number;
  id: string;
  sku: string;
  price: string;
  stock: string;
  attributes: VariantAttribute[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Import FormData interface
interface FormData {
  categoryId: number | null;
  brandId: number | null;
  taxCategoryId: number | null;
  name: string;
  description: string;
  sku: string;
  costPrice: string;
  sellingPrice: string;
  specialPrice: string;
  specialPriceStart: string;
  specialPriceEnd: string;
  active_flag: boolean;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  weight: string;
  length: string;
  width: string;
  height: string;
  shippingClassId: number | null;
  stockQty: string;
  lowStockThreshold: string;
  media: Array<{ url: string; type: 'IMAGE' | 'VIDEO'; }>;
  variants: Array<{
    id: string;
    sku: string;
    price: string;
    stock: string;
    attributes: Array<{ name: string; value: string; }>;
    media?: Array<{ media_id: number; media_url: string; media_type: string; is_primary: boolean; display_order: number; }>;
  }>;
  attributes: Array<{ attribute_id: number; values: string[]; }>;
}

interface CoreProductInfoProps {
  name: string;
  description: string;
  sku: string;
  costPrice: string;
  sellingPrice: string;
  activeFlag: boolean;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  weight: string;
  length: string;
  width: string;
  height: string;
  shippingClassId: number | null;
  stockSet: string;
  stockQty: string;
  lowStockThreshold: string;
  media: Array<{ url: string; type: 'IMAGE' | 'VIDEO'; }>;
  variants: Array<{
    id: string;
    sku: string;
    price: string;
    stock: string;
    attributes: Array<{ name: string; value: string; }>;
    media?: Array<{ media_id: number; media_url: string; media_type: string; is_primary: boolean; display_order: number; }>;
  }>;
  attributes: Array<{ attribute_id: number; values: string[]; }>;
  categoryId: number | null;
  brandId: number | null;
  approval_status?: 'pending' | 'approved' | 'rejected';
  approved_at?: string | null;
  approved_by?: number | null;
  rejection_reason?: string | null;
  onInfoChange: (field: keyof Omit<CoreProductInfoProps, 'onInfoChange' | 'onMediaUpdate' | 'onVariantsUpdate' | 'onAttributesUpdate' | 'errors' | 'categoryId' | 'brandId' | 'approval_status' | 'approved_at' | 'approved_by' | 'rejection_reason' | 'specialPrice' | 'specialPriceStart' | 'specialPriceEnd'>, value: any) => void;
  onMediaUpdate: (media: CoreProductInfoProps['media']) => void;
  onVariantsUpdate: (variants: CoreProductInfoProps['variants']) => void;
  onAttributesUpdate: (attributes: CoreProductInfoProps['attributes']) => void;
  errors?: Record<string, string>;
}

const CoreProductInfo: React.FC<CoreProductInfoProps> = ({
  name,
  description,
  sku,
  costPrice,
  sellingPrice,
  activeFlag,
  metaTitle,
  metaDescription,
  metaKeywords,
  weight,
  length,
  width,
  height,
  shippingClassId,
  stockSet,
  stockQty,
  lowStockThreshold,
  media,
  variants,
  attributes,
  categoryId,
  brandId,
  approval_status = 'pending',
  approved_at = null,
  approved_by = null,
  rejection_reason = null,
  onInfoChange,
  onMediaUpdate,
  onVariantsUpdate,
  onAttributesUpdate,
  errors = {},
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [productId, setProductId] = useState<number | null>(null);
  const [discount, setDiscount] = useState<number>(0);
  
  // Shipping state
  const [weightUnit] = useState('kg');
  const [dimensionUnit] = useState('cm');
  const [shippingClass] = useState('');

  // Stock state
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);
  const [stockError, setStockError] = useState<string | null>(null);
  const [stockSuccess, setStockSuccess] = useState<string | null>(null);

  // Meta state
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');

  // Add variants state
  const [variantErrors, setVariantErrors] = useState<{
    variants?: {
      [key: string]: {
        sku?: string;
        price?: string;
        stock?: string;
        attributes?: {
          [key: string]: string;
        };
      };
    };
  }>({});

  // Add new state for attributes
  const [selectedAttributes, setSelectedAttributes] = useState<Record<number, string | string[]>>({});
  const [attributeErrors, setAttributeErrors] = useState<Record<string, any>>({});

  // Function to generate SKU from product name
  const generateSKU = (productName: string) => {
    if (!productName) return '';
    const cleanName = productName
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .toUpperCase()
      .trim();
    const words = cleanName.split(/\s+/);
    const skuParts = words.map(word => word.slice(0, 3));
    const timestamp = Date.now().toString().slice(-4);
    return `${skuParts.join('-')}-${timestamp}`.slice(0, 20); // Limit SKU length
  };

  // Update SKU when product name changes (if SKU is not already set or product is new)
  useEffect(() => {
    if (name && !sku) { // Only generate if SKU is empty
      const generatedSKU = generateSKU(name);
      onInfoChange('sku', generatedSKU);
    }
  }, [name]); // sku removed from dependency array to prevent re-generation on edit

  // Calculate discount whenever cost price or selling price changes
  useEffect(() => {
    const cost = parseFloat(costPrice) || 0;
    const selling = parseFloat(sellingPrice) || 0;
    
    if (cost > 0 && selling > 0 && selling < cost) { // Ensure selling price is less than cost for a discount
      const calculatedDiscount = ((cost - selling) / cost) * 100;
      setDiscount(Math.round(calculatedDiscount * 100) / 100);
    } else {
      setDiscount(0);
    }
  }, [costPrice, sellingPrice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryId || !brandId) {
      setSubmitError('Please select both category and brand before saving core product info.');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_name: name,
          product_description: description, 
          sku: sku,
          cost_price: parseFloat(costPrice) || 0,
          selling_price: parseFloat(sellingPrice) || 0,
          category_id: categoryId,
          brand_id: brandId,
          discount_percentage: discount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create product core info');
      }

      const data = await response.json();
      console.log('Product core info saved successfully:', data);
      
      const newProductId = data.product_id;
      setProductId(newProductId);
    } catch (error) {
      console.error('Error saving product core info:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to save product core info');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCoreInfoChange = (
    field: keyof Omit<CoreProductInfoProps, 'onInfoChange' | 'onMediaUpdate' | 'onVariantsUpdate' | 'onAttributesUpdate' | 'errors' | 'categoryId' | 'brandId' | 'approval_status' | 'approved_at' | 'approved_by' | 'rejection_reason' | 'specialPrice' | 'specialPriceStart' | 'specialPriceEnd'>,
    value: any
  ) => {
    onInfoChange(field, value);
  };

  const handleShippingChange = (
    field: 'weight' | 'length' | 'width' | 'height' | 'shippingClassId' | 'weightUnit' | 'dimensionUnit' | 'shippingClass',
    value: string
  ) => {
    onInfoChange(field, value);
  };

  const handleDimensionsChange = (field: 'length' | 'width' | 'height', value: string) => {
    onInfoChange(field, value);
  };

  const handleMetaChange = (field: string, value: string) => {
    switch (field) {
      case 'metaTitle': onInfoChange('metaTitle', value); break;
      case 'metaDescription': onInfoChange('metaDescription', value); break;
      case 'metaKeywords': onInfoChange('metaKeywords', value); break;
      case 'shortDescription': setShortDescription(value); break;
      case 'fullDescription': setFullDescription(value); break;
    }
  };

  const handleUpdateStock = async () => {
    if (!productId) {
      setStockError('Product ID is required to update stock. Save core product info first.');
      return;
    }
    try {
      setIsUpdatingStock(true);
      setStockError(null);
      setStockSuccess(null);
      const stockData = {
        stock_qty: parseInt(stockQty) || 0,
        low_stock_threshold: parseInt(lowStockThreshold) || 0
      };
      const response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/products/${productId}/stock`, {
        method: 'PUT', // Or POST if your backend expects that for creation
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stockData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update stock');
      }
      setStockSuccess('Stock updated successfully');
    } catch (error) {
      console.error('Error updating stock:', error);
      setStockError(error instanceof Error ? error.message : 'Failed to update stock');
    } finally {
      setIsUpdatingStock(false);
    }
  };

  const handleVariantsChange = (newVariants: Variant[]) => {
    onVariantsUpdate(newVariants as any);
    setVariantErrors({});
  };

  const handleAttributeSelect = (attributeId: number, value: string | string[]) => {
    setSelectedAttributes(prev => ({ ...prev, [attributeId]: value }));
  };

  const handleAddVariant = (variantData: {
    sku: string;
    price: string;
    stock: string;
    attributes: Array<{ name: string }>;
  }) => {
    const newVariant = {
      id: `variant-${Date.now()}`, // Add unique id
      sku: variantData.sku,
      price: variantData.price,
      stock: variantData.stock,
      attributes: variantData.attributes.map(attr => ({
        name: attr.name,
        value: '' // Initialize with empty value
      })),
      media: []
    };
    onVariantsUpdate([...variants, newVariant]);
  };

  // Add approval status display component
  const ApprovalStatusDisplay = () => {
    const getStatusStyles = () => {
      switch (approval_status) {
        case 'approved':
          return 'bg-green-50 border-green-200 text-green-800';
        case 'rejected':
          return 'bg-red-50 border-red-200 text-red-800';
        case 'pending':
        default:
          return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      }
    };

    const getStatusText = () => {
      switch (approval_status) {
        case 'approved':
          return 'Approved';
        case 'rejected':
          return 'Rejected';
        case 'pending':
        default:
          return 'Pending Approval';
      }
    };

    return (
      <div className={`p-4 rounded-lg border ${getStatusStyles()}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">Approval Status</h3>
            <p className="text-sm mt-1">{getStatusText()}</p>
            {approval_status === 'approved' && approved_at && (
              <p className="text-xs mt-1">Approved on: {new Date(approved_at).toLocaleDateString()}</p>
            )}
            {approval_status === 'rejected' && rejection_reason && (
              <p className="text-xs mt-1 text-red-600">Reason: {rejection_reason}</p>
            )}
          </div>
          {approval_status === 'rejected' && (
            <button
              onClick={() => {
                // Reset approval status to pending when resubmitting
              }}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Resubmit for Approval
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Add Approval Status Display at the top */}
      <ApprovalStatusDisplay />

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Category and Brand Selection Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClassName}>Category</label>
            <div className={`mt-1 flex items-center w-full rounded-md shadow-sm sm:text-sm p-2.5 border ${
                !categoryId ? 'bg-yellow-50 border-yellow-300 text-yellow-700' : 'bg-green-50 border-green-300 text-green-700'
              }`}>
              {categoryId ? <CheckCircleIcon className="h-5 w-5 mr-2 text-green-500" /> : <ShieldExclamationIcon className="h-5 w-5 mr-2 text-yellow-500" />}
              {categoryId ? `Category Selected (ID: ${categoryId})` : 'Please select a category'}
            </div>
            {errors.categoryId && !categoryId && ( // Show error only if not selected
              <p className={errorTextClassName}>{errors.categoryId}</p>
            )}
          </div>

          <div>
            <label className={labelClassName}>Brand</label>
            <div className={`mt-1 flex items-center w-full rounded-md shadow-sm sm:text-sm p-2.5 border ${
                !brandId ? 'bg-yellow-50 border-yellow-300 text-yellow-700' : 'bg-green-50 border-green-300 text-green-700'
              }`}>
              {brandId ? <CheckCircleIcon className="h-5 w-5 mr-2 text-green-500" /> : <ShieldExclamationIcon className="h-5 w-5 mr-2 text-yellow-500" />}
              {brandId ? `Brand Selected (ID: ${brandId})` : 'Please select a brand'}
            </div>
            {errors.brandId && !brandId && ( // Show error only if not selected
              <p className={errorTextClassName}>{errors.brandId}</p>
            )}
          </div>
        </div>

        {/* Product Name */}
        <div>
          <label htmlFor="name" className={labelClassName}>Product Name</label>
          <input type="text" id="name" value={name} onChange={(e) => handleCoreInfoChange('name', e.target.value)} className={inputClassName(!!errors.name)} placeholder="e.g., Premium Cotton T-Shirt" required/>
          {errors.name && <p className={errorTextClassName}>{errors.name}</p>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className={labelClassName}>Short Description (for product card)</label>
          <textarea id="description" rows={3} value={description} onChange={(e) => handleCoreInfoChange('description', e.target.value)} className={inputClassName(!!errors.description)} placeholder="Briefly describe your product..." />
          {errors.description && <p className={errorTextClassName}>{errors.description}</p>}
        </div>

        {/* SKU */}
        <div>
          <label htmlFor="sku" className={labelClassName}>SKU (Stock Keeping Unit)</label>
          <input type="text" id="sku" value={sku} onChange={(e) => handleCoreInfoChange('sku', e.target.value)} className={`${inputClassName(!!errors.sku)} bg-gray-50`} placeholder="e.g., TSHIRT-BLK-LG-001" required/>
          {errors.sku && <p className={errorTextClassName}>{errors.sku}</p>}
          <p className="mt-1 text-xs text-gray-500">Auto-generated if left empty, or you can provide your own.</p>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="costPrice" className={labelClassName}>Cost Price (Your cost)</label>
            <input type="number" id="costPrice" value={costPrice} onChange={(e) => handleCoreInfoChange('costPrice', e.target.value)} step="0.01" min="0" className={inputClassName(!!errors.costPrice)} placeholder="0.00" required/>
            {errors.costPrice && <p className={errorTextClassName}>{errors.costPrice}</p>}
          </div>
          <div>
            <label htmlFor="sellingPrice" className={labelClassName}>Selling Price (Customer price)</label>
            <input type="number" id="sellingPrice" value={sellingPrice} onChange={(e) => handleCoreInfoChange('sellingPrice', e.target.value)} step="0.01" min="0" className={inputClassName(!!errors.sellingPrice)} placeholder="0.00" required/>
            {errors.sellingPrice && <p className={errorTextClassName}>{errors.sellingPrice}</p>}
          </div>
        </div>

        {/* Discount Display */}
        {(parseFloat(costPrice) > 0 && parseFloat(sellingPrice) > 0) && (
          <div className="bg-orange-50 p-4 rounded-md border border-orange-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-orange-700">
                Calculated {discount >= 0 ? 'Discount' : 'Markup'}
              </span>
              <span
                className={`text-lg font-semibold ${
                  discount >= 0
                    ? discount > 0
                      ? 'text-green-600'
                      : 'text-gray-600'
                    : 'text-red-600'
                }`}
              >
                {discount > 0
                  ? `${discount}%`
                  : discount < 0
                  ? `${Math.abs(discount)}% Markup`
                  : 'No discount/markup'}
              </span>
            </div>
            {discount !== 0 && (
              <p className="mt-1 text-sm text-orange-600">
                Based on cost price of ${parseFloat(costPrice).toFixed(2)} and selling
                price of ${parseFloat(sellingPrice).toFixed(2)}.
              </p>
            )}
          </div>
        )}

        {submitError && (
          <div className="p-4 my-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{submitError}</p>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting || !categoryId || !brandId}
            className="px-6 py-2.5 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : approval_status === 'rejected' ? 'Resubmit Product' : 'Save Product'}
          </button>
        </div>
      </form>

      {/* Attribute Selection Section - only if categoryId and productId exist */}
      {categoryId && productId && (
        <div>
          <h2 className={sectionTitleClassName}>Product Attributes</h2>
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <AttributeSelection
              categoryId={categoryId}
              productId={productId}
              selectedAttributes={selectedAttributes}
              onAttributeSelect={handleAttributeSelect}
              errors={attributeErrors}
            />
          </div>
        </div>
      )}

      {/* Other sections - only if productId exists */}
      {productId && (
        <>
          <div>
            <h2 className={sectionTitleClassName}>Product Media</h2>
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
              <ProductMediaUpload
                productId={productId}
                onMediaChange={(mediaFiles) => console.log('Media updated in Core:', mediaFiles)}
              />
            </div>
          </div>

          <div>
            <h2 className={sectionTitleClassName}>Shipping Details</h2>
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
              <ShippingDetails
                productId={productId}
                weight={weight}
                weightUnit={weightUnit}
                dimensions={{ length, width, height }}
                dimensionUnit={dimensionUnit}
                shippingClass={shippingClass}
                onShippingChange={handleShippingChange}
                onDimensionsChange={handleDimensionsChange}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Stock Management</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="stockSet" className="block text-sm font-medium text-gray-700">
                    Stock Set
                  </label>
                  <input
                    type="number"
                    id="stockSet"
                    name="stockSet"
                    value={stockSet}
                    onChange={(e) => onInfoChange('stockSet', e.target.value)}
                    min="1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                    placeholder="Enter stock set"
                  />
                  {errors?.stockSet && (
                    <p className="mt-1 text-sm text-red-600">{errors.stockSet}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-gray-700">
                    Low Stock Set Threshold
                  </label>
                  <input
                    type="number"
                    id="lowStockThreshold"
                    name="lowStockThreshold"
                    value={lowStockThreshold}
                    onChange={(e) => onInfoChange('lowStockThreshold', e.target.value)}
                    min="0"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                    placeholder="Enter low stock threshold"
                  />
                  {errors?.lowStockThreshold && (
                    <p className="mt-1 text-sm text-red-600">{errors.lowStockThreshold}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="stockQty" className="block text-sm font-medium text-gray-700">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    id="stockQty"
                    name="stockQty"
                    value={stockQty}
                    onChange={(e) => onInfoChange('stockQty', e.target.value)}
                    min="0"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                    placeholder="Enter stock quantity"
                  />
                  {errors?.stockQty && (
                    <p className="mt-1 text-sm text-red-600">{errors.stockQty}</p>
                  )}
                </div>
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  Example: If you set Stock Set to 5 and Stock Quantity to 20, it means you have 5 sets available, where each set contains 20 items. 
                  Total items in stock would be 100 (5 sets × 20 items per set).
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className={sectionTitleClassName}>Detailed Descriptions & SEO</h2>
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
              <ProductMeta
                productId={productId}
                metaTitle={metaTitle}
                metaDescription={metaDescription}
                metaKeywords={metaKeywords}
                shortDescription={shortDescription}
                fullDescription={fullDescription}
                onMetaChange={handleMetaChange}
              />
            </div>
          </div>
          
          <div>
            <h2 className={sectionTitleClassName}>Product Variants</h2>
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
              <ProductVariants
                productId={productId}
                variants={variants}
                onVariantsChange={handleVariantsChange}
                errors={variantErrors}
                categoryId={categoryId}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CoreProductInfo;