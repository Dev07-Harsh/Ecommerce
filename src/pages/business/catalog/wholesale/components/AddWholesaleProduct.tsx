import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CategorySelection from './CategorySelection';
import BrandSelection from './BrandSelection'; // Keep import but might not be used directly in renderStepContent if CategorySelection includes it
import TaxCategorySelection from './TaxCategorySelection';
import CoreProductInfo from './CoreProductInfo';

// Define steps for the form
const steps = [
  'Category & Brand',
  'Product Details',
  'Tax Category',
];

// Adjusted FormData interface based on linter errors and expected prop types by step components
interface FormData {
  categoryId: number | null;
  brandId: number | null;
  taxCategoryId: number | null;
  name: string;
  description: string; // Short description
  sku: string;
  costPrice: string; // Use string for input binding
  sellingPrice: string; // Use string for input binding
  active_flag: boolean;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  weight: string; // Use string for input binding
  length: string; // Use string for input binding
  width: string; // Use string for input binding
  height: string; // Use string for input binding
  shippingClassId: number | null;
  stockSet: string; // New field for stock set
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

const AddWholesaleProduct: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, any>>({});
  const [createdProductId, setCreatedProductId] = useState<number | null>(null);

  // Initialize formData with default values matching the FormData interface
  const [formData, setFormData] = useState<FormData>({
    categoryId: null,
    brandId: null,
    taxCategoryId: null,
    name: '',
    description: '',
    sku: '',
    costPrice: '',
    sellingPrice: '',
    active_flag: true,
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    weight: '',
    length: '',
    width: '',
    height: '',
    shippingClassId: null,
    stockSet: '1', // Initialize with default value of 1
    stockQty: '0',
    lowStockThreshold: '0',
    media: [],
    variants: [],
    attributes: [],
  });

  useEffect(() => {
    // Placeholder for fetching data in edit/view mode
  }, [id]);

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const validateStep = () => {
    const newErrors: Record<string, any> = {};
    switch (activeStep) {
      case 0: // Category & Brand
        if (!formData.categoryId) newErrors.categoryId = 'Category is required';
        if (formData.categoryId && !formData.brandId) newErrors.brandId = 'Brand is required';
        break;
      case 1: // Product Details (handled by CoreProductInfo)
        if (!formData.name) newErrors.name = 'Product name is required';
        if (!formData.sku) newErrors.sku = 'SKU is required';
        if (!formData.sellingPrice) newErrors.sellingPrice = 'Selling price is required';
        // Add more validation for CoreProductInfo fields if needed here or within CoreProductInfo
        // Example: Basic validation for number fields if they are required and expected to be numbers
         if (formData.costPrice !== '' && isNaN(Number(formData.costPrice))) newErrors.costPrice = 'Cost price must be a number';
         if (isNaN(Number(formData.sellingPrice))) newErrors.sellingPrice = 'Selling price must be a number';
         // Add similar checks for weight, dimensions if required
        break;
      case 2: // Tax Category
        if (!formData.taxCategoryId) newErrors.taxCategoryId = 'Tax category is required';
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFinalSubmit = async () => {
    if (!validateStep()) return;

    setLoading(true);
    setErrors({});
    try {
      // Assemble the final product data from formData state
      const finalProductData = {
        ...formData,
        // Convert string numbers to actual numbers where necessary before sending to API
        cost_price: Number(formData.costPrice) || 0, // Match API expected key
        selling_price: Number(formData.sellingPrice) || 0, // Match API expected key
         // Convert weight and dimensions
        shipping_details: {
           weight: Number(formData.weight) || 0,
           length: Number(formData.length) || 0,
           width: Number(formData.width) || 0,
           height: Number(formData.height) || 0,
           shipping_class_id: formData.shippingClassId,
        },
        // Variants price and stock need conversion if they are strings from inputs
        variants: formData.variants.map(variant => ({
           ...variant,
           price: Number(variant.price) || 0,
           stock: Number(variant.stock) || 0,
        })),
        // Ensure API expects 'description' for short description
        description: formData.description,
         // Ensure API expects 'meta_' prefixed keys
        meta_title: formData.metaTitle,
        meta_description: formData.metaDescription,
        meta_keywords: formData.metaKeywords,
         // active_flag, category_id, brand_id, tax_category_id are already in formData with correct keys/types
         category_id: formData.categoryId,
         brand_id: formData.brandId,
         tax_category_id: formData.taxCategoryId,
      };

      console.log('Submitting Final Wholesale Product Data:', finalProductData);

      // *** API CALLS FOR CREATING WHOLESALE PRODUCT ***
      // This section needs to be implemented based on your backend API.
      // You would typically make a POST request with finalProductData.

      // Simulate API call success
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Assuming successful creation, navigate to the wholesale list page
      navigate('/business/catalog/wholesale');

    } catch (error) {
      console.error('Error creating wholesale product:', error);
      setErrors(prev => ({ ...prev, submit: 'Failed to save wholesale product. Please try again.' }));
    } finally {
      setLoading(false);
    }
  };

  // Callback for Category/Brand selection to update parent formData
  const handleCategoryBrandUpdate = (categoryId: number | null, brandId: number | null) => {
    setFormData(prev => ({ ...prev, categoryId, brandId }));
  };

  // Callback for CoreProductInfo to update parent's formData fields
  const handleCoreInfoChange = (
    field: keyof Omit<FormData, 'categoryId' | 'brandId' | 'taxCategoryId' | 'media' | 'variants' | 'attributes' | 'specialPrice' | 'specialPriceStart' | 'specialPriceEnd'>,
    value: FormData[typeof field]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Callbacks for updating specific complex parts of formData
  const handleMediaUpdate = (mediaFiles: FormData['media']) => {
      setFormData(prev => ({ ...prev, media: mediaFiles }));
  };

  const handleVariantsUpdate = (variantsData: FormData['variants']) => {
      setFormData(prev => ({ ...prev, variants: variantsData }));
  };

  const handleAttributesUpdate = (attributesData: FormData['attributes']) => {
      setFormData(prev => ({ ...prev, attributes: attributesData }));
  };

  // Callback for TaxCategorySelection to update parent formData
  const handleTaxCategoryUpdate = (taxId: number | null) => {
    setFormData(prev => ({ ...prev, taxCategoryId: taxId }));
  };

  // Renders the content of the current step
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <div className="space-y-6">
            <CategorySelection
               selectedCategoryId={formData.categoryId}
               onCategorySelect={(catId) => handleCategoryBrandUpdate(catId, null)}
               selectedBrandId={formData.brandId}
               onBrandSelect={(brandId) => handleCategoryBrandUpdate(formData.categoryId, brandId)}
               errors={errors} // Pass down relevant errors
             />
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
             <CoreProductInfo
                // Pass relevant formData fields as individual props, handling potential null/undefined for inputs
                name={formData.name}
                description={formData.description}
                sku={formData.sku}
                costPrice={formData.costPrice || ''} // Pass empty string for input if null/undefined
                sellingPrice={formData.sellingPrice || ''} // Pass empty string for input if null/undefined
                activeFlag={formData.active_flag}
                metaTitle={formData.metaTitle}
                metaDescription={formData.metaDescription}
                metaKeywords={formData.metaKeywords}
                weight={formData.weight || ''} // Pass empty string for input if null/undefined
                length={formData.length || ''} // Pass empty string for input if null/undefined
                width={formData.width || ''} // Pass empty string for input if null/undefined
                height={formData.height || ''} // Pass empty string for input if null/undefined
                shippingClassId={formData.shippingClassId}
                stockSet={formData.stockSet} // Pass the new stockSet field
                stockQty={formData.stockQty}
                lowStockThreshold={formData.lowStockThreshold}
                media={formData.media}
                variants={formData.variants}
                attributes={formData.attributes}
                categoryId={formData.categoryId}
                brandId={formData.brandId}

                // Pass callbacks for CoreProductInfo to update parent formData
                onInfoChange={handleCoreInfoChange}
                onMediaUpdate={handleMediaUpdate}
                onVariantsUpdate={handleVariantsUpdate}
                onAttributesUpdate={handleAttributesUpdate}

                errors={errors} // Pass down relevant errors
                // onProductCreated={setCreatedProductId} // Uncomment if CoreProductInfo creates product here
             />
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
             <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
               <h2 className="text-lg font-medium text-gray-900 mb-4">Select Tax Category</h2>
               <p className="text-sm text-gray-500 mb-6">
                 Choose the appropriate tax category for your wholesale product. This will determine the tax rate applied to sales.
               </p>
               <TaxCategorySelection
                 selectedTaxCategoryId={formData.taxCategoryId}
                 onTaxCategorySelect={handleTaxCategoryUpdate}
                 errors={errors} // Pass down relevant errors
               />
             </div>
          </div>
        );
      default:
        return null;
    }
  };

  const currentStepTitle = steps[activeStep];
  const isLastStep = activeStep === steps.length - 1;

  return (
    <div className="container mx-auto px-4 py-8">
        {/* Stepper Header (Title, Step Indicator, Progress Bar) */}
        <div className="mb-6 p-4 bg-white shadow rounded-lg border border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-800">
                Add New Wholesale Product
            </h1>
            <p className="text-sm text-gray-500">Step {activeStep + 1} of {steps.length}: {currentStepTitle}</p>
            {/* Progress Bar */}
            <div className="mt-3 bg-gray-200 rounded-full h-2.5">
                <div className="bg-orange-600 h-2.5 rounded-full" style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}></div>
            </div>
        </div>

      {/* Step Content Area */}
      <div className="bg-white shadow-xl rounded-lg p-6 md:p-8 border border-gray-200">
        {renderStepContent()}
        {errors.submit && ( // Display general submission errors
            <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                {errors.submit}
            </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 pt-6 border-t flex justify-between items-center">
          <button
            type="button"
            onClick={handleBack}
            disabled={activeStep === 0 || loading}
            className={`px-6 py-2.5 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-opacity ${
              activeStep === 0 || loading ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50' : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Back
          </button>
          {isLastStep ? (
            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={loading}
              className="px-6 py-2.5 text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Create Wholesale Product'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              disabled={loading || Object.keys(errors).length > 0} // Disable if loading or if there are validation errors
              className="px-6 py-2.5 text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddWholesaleProduct; 