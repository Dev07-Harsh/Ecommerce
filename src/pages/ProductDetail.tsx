import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // Added useNavigate
import { Star, Check, ShoppingCart, Heart, ArrowLeft, ChevronRight, Share2, Info } from 'lucide-react'; // Added Info
import { useCart } from '../context/CartContext'; // Assuming CartContext exists
import { toast } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// --- START OF INTERFACE DEFINITIONS ---

// Tab type
type TabType = 'product-details' | 'information' | 'reviews';

// Base Product Media (from product details endpoint)
interface ProductMedia {
  media_id: number;
  type: string; // "IMAGE" or "VIDEO"
  url: string;
  sort_order: number;
}

// Base Product Meta (from product details endpoint)
interface ProductMeta {
  short_desc: string | null;
  full_desc: string | null;
  meta_title: string | null;
  meta_desc: string | null;
  meta_keywords: string | null;
}

// Base Product Attribute (from product details endpoint - general attributes)
interface ProductAttribute {
  attribute_id: number;
  attribute_name: string;
  value_code: string | null; // Could be null for text based
  value_text: string;
  value_label: string | null;
  is_text_based: boolean;
}

// Main Product Details structure (from /api/products/:productId/details)
interface ProductDetails {
  product_id: number;
  product_name: string;
  cost_price: number;
  selling_price: number;
  discount_pct: number;
  description: string; // Main fallback description
  media: ProductMedia[];
  meta: ProductMeta | null; // Meta can be null
  attributes: ProductAttribute[];
  category: {
    category_id: number;
    name: string;
  } | null; // Category can be null
  brand: {
    brand_id: number;
    name: string;
  } | null; // Brand can be null
  sku?: string; // Base product SKU if available
  // Placeholder fields that might come from your API or you manage
  rating?: number;
  reviews?: any[]; // Define a proper Review interface if needed
  stock?: number; // Base product stock if it exists separately
}

// Variant-specific Attribute (defining attribute of a variant)
interface VariantDefiningAttribute {
  name: string; // e.g., "Color"
  value: string; // e.g., "Red"
}

// Variant-specific Media
interface VariantSpecificMedia {
  media_id: number;
  media_url: string;
  media_type: string; // "IMAGE" or "VIDEO"
  is_primary: boolean;
  display_order: number;
}

// Product Variant structure (from /api/products/:productId/variants)
interface Variant {
  variant_id: number;
  product_id: number;
  sku: string;
  price: number;
  stock: number;
  attributes: VariantDefiningAttribute[]; // Attributes that define this variant
  media?: VariantSpecificMedia[]; // Media specific to this variant
}

// Cart Product structure (for adding to cart)
// This needs to be compatible with your CartContext
interface CartProduct {
  id: string; // Unique ID for cart item (product_id or product_id-variant_id)
  product_id_ref: number; // Reference to the base product_id
  name: string;
  price: number;
  currency: string;
  image: string;
  stock: number;
  sku: string;
  category: string;
  brand_name?: string;
  variant_attributes?: VariantDefiningAttribute[]; // Defining attributes of the chosen variant
  // Add other fields your cart context expects
  isNew?: boolean;
  cost_price?: number;
  discount_pct?: number;
}

// --- END OF INTERFACE DEFINITIONS ---

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate(); // For navigation
  const { addToCart } = useCart();

  // --- STATE DEFINITIONS ---
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('product-details');

  // Base product data
  const [product, setProduct] = useState<ProductDetails | null>(null);
  // List of variants for the product
  const [variants, setVariants] = useState<Variant[]>([]);
  // Currently selected variant object
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

  // Data to actually display (either base product or merged with selected variant)
  // Initialize with a structure similar to ProductDetails but allow for overrides
  const [displayData, setDisplayData] = useState<Partial<ProductDetails> & { selling_price?: number, media?: ProductMedia[], attributes?: ProductAttribute[] }>({});


  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // --- END OF STATE DEFINITIONS ---

  useEffect(() => {
    const fetchProductData = async () => {
      if (!productId) return;
      setLoading(true);
      setError(null);
      setSelectedVariant(null); // Reset selected variant on product change
      setQuantity(1); // Reset quantity

      try {
        // 1. Fetch Base Product Details
        const productResponse = await fetch(`${API_BASE_URL}/api/products/${productId}/details`);
        if (!productResponse.ok) {
          if (productResponse.status === 404) throw new Error('Product not found.');
          throw new Error(`Failed to fetch product details: ${productResponse.status}`);
        }
        const productData: ProductDetails = await productResponse.json();
        setProduct(productData);
        setDisplayData(productData); // Initially display base product details
        if (productData.media && productData.media.length > 0) {
          setSelectedImage(productData.media.find(m => m.type === "IMAGE")?.url || productData.media[0].url);
        } else {
          setSelectedImage('/placeholder-image.png'); // Fallback image
        }

        // 2. Fetch Product Variants
        const variantsResponse = await fetch(`${API_BASE_URL}/api/products/${productId}/variants`);
        if (!variantsResponse.ok) {
          console.warn(`No variants found or failed to fetch variants for product ${productId}: ${variantsResponse.status}`);
          setVariants([]);
        } else {
          const rawVariantsData: any[] = await variantsResponse.json();
          const formattedVariants = rawVariantsData.map((vData): Variant => ({
            variant_id: vData.variant_id,
            product_id: vData.product_id,
            sku: vData.sku,
            price: parseFloat(String(vData.price)),
            stock: parseInt(String(vData.stock), 10),
            attributes: Array.isArray(vData.attributes) ? vData.attributes : [],
            media: (vData.media || []).map((m: any): VariantSpecificMedia => ({
              media_id: m.media_id,
              media_url: m.media_url,
              media_type: m.media_type,
              is_primary: m.is_primary,
              display_order: m.display_order,
            })),
          }));
          setVariants(formattedVariants);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        console.error('Error fetching product data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [productId]);


  // --- DERIVED STATE & MEMOS ---
  // Use useMemo for complex derived data if needed, e.g., available variant options

  // --- EVENT HANDLERS ---
  const handleVariantSelect = (variant: Variant) => {
    if (!product) return;
    setSelectedVariant(variant);
    setQuantity(1); // Reset quantity when variant changes

    // Prepare data for display, merging base product with variant specifics
    const newDisplayData: Partial<ProductDetails> & { selling_price?: number, media?: ProductMedia[], attributes?: ProductAttribute[] } = {
      ...product, // Start with all base product details
      selling_price: variant.price, // Override price
      // Override media if variant has its own
      media: variant.media && variant.media.length > 0
        ? variant.media.map(m => ({
            media_id: m.media_id,
            type: m.media_type.toUpperCase(),
            url: m.media_url,
            sort_order: m.display_order,
          }))
        : product.media, // Fallback to base product media
      
      // For attributes to display under "Technical Specifications" or similar,
      // we can show the variant's defining attributes.
      // The base product.attributes are general.
      attributes: variant.attributes.map((attr, index) => ({
          attribute_id: -(variant.variant_id * 1000 + index + 1), // Temporary unique key
          attribute_name: attr.name,
          value_text: attr.value,
          value_code: `${attr.name.toLowerCase().replace(/\s+/g, '-')}-${attr.value.toLowerCase().replace(/\s+/g, '-')}`,
          value_label: attr.value,
          is_text_based: true, // Assume variant attributes are text for this display
      })),
      sku: variant.sku, // Use variant's SKU
      stock: variant.stock, // Use variant's stock
    };
    setDisplayData(newDisplayData);

    // Update selected image to variant's primary image or first image
    if (variant.media && variant.media.length > 0) {
      const primaryVariantMedia = variant.media.find(m => m.is_primary && m.media_type.toUpperCase() === 'IMAGE');
      const firstVariantImage = variant.media.find(m => m.media_type.toUpperCase() === 'IMAGE');
      setSelectedImage(primaryVariantMedia?.media_url || firstVariantImage?.media_url || product.media?.[0]?.url || '/placeholder-image.png');
    } else if (product.media && product.media.length > 0) {
      setSelectedImage(product.media.find(m => m.type === "IMAGE")?.url || product.media[0].url); // Fallback to base product image
    } else {
        setSelectedImage('/placeholder-image.png');
    }
  };

  const clearVariantSelection = () => {
    if (!product) return;
    setSelectedVariant(null);
    setDisplayData(product); // Revert to base product data
    setQuantity(1);
    if (product.media && product.media.length > 0) {
        setSelectedImage(product.media.find(m => m.type === "IMAGE")?.url || product.media[0].url);
    } else {
        setSelectedImage('/placeholder-image.png');
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    const itemBeingAdded = selectedVariant || product; // Use selected variant if available, else base product
    const currentStock = selectedVariant ? selectedVariant.stock : (product.stock ?? Infinity); // Use variant stock or assume base product has stock

    if (currentStock < quantity) {
        toast.error("Not enough items in stock.");
        return;
    }
    if (currentStock === 0) {
        toast.error("This item is out of stock.");
        return;
    }

    const cartProduct: CartProduct = {
      id: selectedVariant ? `${product.product_id}-${selectedVariant.variant_id}` : String(product.product_id),
      product_id_ref: product.product_id,
      name: selectedVariant 
            ? `${product.product_name} (${selectedVariant.attributes.map(a => a.value).join(' / ')})` 
            : product.product_name,
      price: selectedVariant ? selectedVariant.price : product.selling_price,
      currency: 'INR', // Assuming INR
      image: selectedVariant?.media?.find(m=>m.is_primary)?.media_url || selectedVariant?.media?.[0]?.media_url || product.media?.[0]?.url || '/placeholder-image.png',
      stock: currentStock, // This is the stock of the specific item (variant or base)
      sku: selectedVariant ? selectedVariant.sku : (product.sku || `BASE-${product.product_id}`),
      category: product.category?.name || 'Uncategorized',
      brand_name: product.brand?.name,
      variant_attributes: selectedVariant ? selectedVariant.attributes : undefined,
      cost_price: product.cost_price, // Base product cost price
      discount_pct: product.discount_pct, // Base product discount
    };
    
    addToCart(cartProduct, quantity);
    toast.success(`${cartProduct.name} added to cart!`);
  };

  const handleQuantityChange = (amount: number) => {
    setQuantity(prev => Math.max(1, prev + amount));
  };

  // --- RENDER HELPER FUNCTIONS ---
  const renderVariantSelectors = () => {
    if (!variants || variants.length === 0) return null;
  
    // This assumes variants are primarily distinguished by a single attribute's value,
    // and each variant object in `variants` represents one such unique option.
    // The `variant.attributes` from backend should be like `[{name: "Color", value: "Red"}]`
    // or `[{name: "Size", value: "Large"}]`.
    // If variants are defined by combinations (e.g., Color AND Size), this UI needs to be more complex.
  
    // For simplicity, let's assume the first attribute in a variant's attribute list is the primary one to display.
    // Or, if all variants share a common attribute name (e.g., "Color"), we can group by that.
    const firstAttributeName = variants[0]?.attributes[0]?.name || "Select Option";
  
    return (
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-800 mb-2">{firstAttributeName}:</h4>
        <div className="flex flex-wrap gap-3">
          {variants.map(variant => {
            const displayValue = variant.attributes[0]?.value || variant.sku; // Fallback for display
            const isSelected = selectedVariant?.variant_id === variant.variant_id;
            const isOutOfStock = variant.stock === 0;
  
            // Try to get a specific image for this variant option button
            const optionImage = variant.media?.find(m => m.is_primary && m.media_type.toUpperCase() === 'IMAGE')?.media_url ||
                                variant.media?.find(m => m.media_type.toUpperCase() === 'IMAGE')?.media_url;
  
            return (
              <button
                key={variant.variant_id}
                onClick={() => handleVariantSelect(variant)}
                disabled={isOutOfStock}
                className={`p-1 border-2 rounded-md text-sm transition-all flex items-center space-x-2 min-w-[60px] justify-center
                  ${isSelected ? 'border-primary-500 ring-2 ring-primary-500 ring-offset-1' : 'border-gray-300 hover:border-gray-400'}
                  ${isOutOfStock ? 'opacity-60 cursor-not-allowed relative bg-gray-100' : 'bg-white hover:bg-gray-50'}
                `}
                title={isOutOfStock ? `${displayValue} - Out of Stock` : displayValue}
              >
                {optionImage && (
                  <img src={optionImage} alt={displayValue} className="w-8 h-8 object-cover rounded-sm flex-shrink-0" />
                )}
                <span className={optionImage ? "truncate" : "px-2 py-1"}>{displayValue}</span>
                {isOutOfStock && (
                  <span 
                    className="absolute -top-2 -right-2 text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full shadow-md text-[10px]"
                    title="Out of stock"
                  >
                    Sold Out
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {selectedVariant && (
          <button 
            onClick={clearVariantSelection} 
            className="text-xs text-blue-600 hover:underline mt-3"
          >
            Show base product details
          </button>
        )}
      </div>
    );
  };

  const renderProductSpecificationAttributes = () => {
    // These are the general attributes of the base product
    if (!product?.attributes || product.attributes.length === 0) return null;

    return product.attributes.map((attr) => (
        <tr key={`base-attr-${attr.attribute_id}-${attr.value_code || attr.value_text}`} className="border-b border-gray-200 hover:bg-gray-50">
          <td className="py-3 px-2 sm:px-4 font-medium text-gray-600 w-1/3 sm:w-1/4">{attr.attribute_name}</td>
          <td className="py-3 px-2 sm:px-4 text-gray-700">
            {attr.is_text_based ? attr.value_text : attr.value_label || attr.value_text}
          </td>
        </tr>
      ));
  };
  
  const renderVariantDefiningAttributesInTable = () => {
    // These are the attributes that define the *selected* variant
    if (!selectedVariant || !displayData.attributes || displayData.attributes.length === 0) return null;
  
    return displayData.attributes.map((attr, index) => (
      <tr key={`variant-display-attr-${index}`} className="border-b border-gray-200 bg-primary-50 hover:bg-primary-100">
        <td className="py-3 px-2 sm:px-4 font-medium text-primary-700 w-1/3 sm:w-1/4">{attr.attribute_name} (Selected)</td>
        <td className="py-3 px-2 sm:px-4 text-primary-800 font-semibold">
          {attr.value_text} {/* `handleVariantSelect` formats it to use value_text */}
        </td>
      </tr>
    ));
  };


  const renderTabContent = () => {
    if (!product || !displayData) return <div className="text-center py-10 text-gray-500">Loading content...</div>;
    // Use displayData for most content, but product for stable things like category, brand, base description
    
    switch(activeTab) {
      case 'product-details':
        return (
          <div className="py-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">{displayData.meta?.meta_title || displayData.product_name}</h3>
            {displayData.meta?.short_desc && (
              <p className="text-gray-600 mb-4">{displayData.meta.short_desc}</p>
            )}
            {displayData.meta?.full_desc ? (
              <div 
                className="prose prose-sm sm:prose-base max-w-none text-gray-700" // TailwindCSS Prose for nice typography
                dangerouslySetInnerHTML={{ __html: displayData.meta.full_desc }}
              />
            ) : product.description && ( // Fallback to main product description
              <div className="prose prose-sm sm:prose-base max-w-none text-gray-700">
                {product.description}
              </div>
            )}
             {!displayData.meta?.full_desc && !product.description && (
                <p className="text-gray-500 italic">No detailed description available.</p>
             )}
          </div>
        );
      case 'information':
        return (
          <div className="py-6">
            <h3 className="text-xl font-semibold mb-6 text-gray-800">Technical Specifications</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <tbody className="divide-y divide-gray-200">
                  <tr className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-2 sm:px-4 font-medium text-gray-600 w-1/3 sm:w-1/4">Product</td>
                    <td className="py-3 px-2 sm:px-4 text-gray-700">{product.product_name}</td>
                  </tr>
                  {product.category && (
                    <tr className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-2 sm:px-4 font-medium text-gray-600">Category</td>
                      <td className="py-3 px-2 sm:px-4 text-gray-700">{product.category.name}</td>
                    </tr>
                  )}
                  {product.brand && (
                    <tr className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-2 sm:px-4 font-medium text-gray-600">Brand</td>
                      <td className="py-3 px-2 sm:px-4 text-gray-700">{product.brand.name}</td>
                    </tr>
                  )}
                  <tr className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-2 sm:px-4 font-medium text-gray-600">Price</td>
                    <td className="py-3 px-2 sm:px-4 text-gray-700">₹{displayData.selling_price?.toFixed(2)}</td>
                  </tr>
                  {displayData.discount_pct !== undefined && displayData.discount_pct > 0 && (
                    <tr className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-2 sm:px-4 font-medium text-gray-600">Discount</td>
                      <td className="py-3 px-2 sm:px-4 text-gray-700">{displayData.discount_pct}%</td>
                    </tr>
                  )}
                  {displayData.sku && (
                     <tr className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-2 sm:px-4 font-medium text-gray-600">SKU</td>
                        <td className="py-3 px-2 sm:px-4 text-gray-700">{displayData.sku}</td>
                    </tr>
                  )}
                  {/* Variant Defining Attributes (if a variant is selected) */}
                  {renderVariantDefiningAttributesInTable()}
                  {/* Base Product Specification Attributes */}
                  {renderProductSpecificationAttributes()}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'reviews': // Placeholder
        return (
          <div className="py-6">
            <div className="text-center text-gray-500 p-10 border border-dashed rounded-md">
              <Star size={32} className="mx-auto mb-2 text-gray-400" />
              No reviews available for this product yet.
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // --- LOADING AND ERROR STATES ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product || !displayData.product_id) { // Check displayData.product_id to ensure it's populated
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md">
          <Info size={48} className="mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">Oops! Product Not Found</h2>
          <p className="text-gray-600 mb-6">{error || "The product you're looking for doesn't exist or may have been removed."}</p>
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <ArrowLeft size={18} />
            <span>Back to Products</span>
          </button>
        </div>
      </div>
    );
  }
  
  const currentStockForDisplay = selectedVariant ? selectedVariant.stock : (product.stock ?? undefined);

  // --- MAIN JSX RETURN ---
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
          <ChevronRight size={16} className="mx-1.5 text-gray-400" />
          <Link to="/products" className="hover:text-primary-600 transition-colors">Products</Link>
          {product.category && (
            <>
              <ChevronRight size={16} className="mx-1.5 text-gray-400" />
              <Link to={`/category/${product.category.category_id}`} className="hover:text-primary-600 transition-colors">
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight size={16} className="mx-1.5 text-gray-400" />
          <span className="text-gray-700 font-medium truncate max-w-[200px] sm:max-w-xs">
            {displayData.product_name || product.product_name}
          </span>
        </nav>
        
        {/* Product Overview Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0"> {/* Removed gap-4 for closer fit */}
            {/* Product Images - Left Side */}
            <div className="p-4 sm:p-6 space-y-4">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200 relative">
                <img 
                  src={selectedImage || '/placeholder-image.png'} 
                  alt={displayData.product_name || product.product_name} 
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => (e.currentTarget.src = '/placeholder-image.png')} // Fallback for broken image links
                />
                 {displayData.discount_pct !== undefined && displayData.discount_pct > 0 && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow">
                        {displayData.discount_pct}% OFF
                    </div>
                 )}
              </div>
              
              {displayData.media && displayData.media.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {displayData.media.filter(m => m.type.toUpperCase() === "IMAGE").map((media) => ( // Filter for images in thumbnails
                    <button
                      key={media.media_id}
                      className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 p-0.5 transition-all
                        ${selectedImage === media.url ? 'border-primary-500 ring-2 ring-primary-500 ring-offset-1' : 'border-gray-200 hover:border-primary-400'}
                      `}
                      onClick={() => setSelectedImage(media.url)}
                    >
                      <img 
                        src={media.url} 
                        alt={`${displayData.product_name} thumbnail`}
                        className="w-full h-full object-cover rounded-sm"
                        onError={(e) => (e.currentTarget.style.display = 'none')} // Hide broken thumbnail
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Product Info - Right Side */}
            <div className="p-4 sm:p-6 flex flex-col bg-gray-50/50 lg:bg-white border-t lg:border-t-0 lg:border-l border-gray-200">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                {displayData.product_name || product.product_name}
              </h1>
              
              <div className="flex items-center mb-3 text-sm">
                {/* Placeholder for reviews/rating */}
                <div className="flex items-center text-yellow-500">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" className={i < (product.rating || 4) ? 'text-yellow-400' : 'text-gray-300'} />)}
                </div>
                <span className="ml-2 text-gray-500">({(product.reviews?.length || 0) > 0 ? `${product.reviews?.length} Reviews` : 'No reviews yet'})</span>
                <span className="mx-2 text-gray-300">|</span>
                {currentStockForDisplay !== undefined && currentStockForDisplay > 0 && <span className="text-green-600 font-medium">In Stock</span>}
                {currentStockForDisplay === 0 && <span className="text-red-600 font-medium">Out of Stock</span>}
                {currentStockForDisplay === undefined && <span className="text-gray-500">Stock N/A</span>}
              </div>

              <div className="mb-4">
                <div className="flex items-end space-x-2">
                  <span className="text-3xl font-bold text-primary-600">
                    ₹{displayData.selling_price?.toFixed(2)}
                  </span>
                  {displayData.cost_price && displayData.cost_price > (displayData.selling_price || 0) && (
                    <span className="text-lg text-gray-400 line-through">
                      ₹{displayData.cost_price.toFixed(2)}
                    </span>
                  )}
                </div>
                {currentStockForDisplay !== undefined && currentStockForDisplay > 0 && currentStockForDisplay < 10 && (
                    <p className="text-sm text-orange-600 mt-1">Hurry! Only {currentStockForDisplay} left in stock.</p>
                )}
              </div>
              
              {product.brand && (
                <div className="text-sm text-gray-500 mb-1">
                    Brand: <Link to={`/brand/${product.brand.brand_id}`} className="text-primary-600 hover:underline font-medium">{product.brand.name}</Link>
                </div>
              )}
              {displayData.sku && (
                 <div className="text-sm text-gray-500 mb-3">SKU: <span className="font-medium text-gray-700">{displayData.sku}</span></div>
              )}

              {/* Short Description */}
              {displayData.meta?.short_desc && (
                <p className="text-sm text-gray-600 mb-5 leading-relaxed">{displayData.meta.short_desc}</p>
              )}
              
              {/* VARIANT SELECTORS RENDERED HERE */}
              {renderVariantSelectors()}
              
              <div className="mb-5">
                <div className="text-sm font-semibold text-gray-700 mb-1">Quantity:</div>
                <div className="flex items-center border border-gray-300 rounded-md overflow-hidden w-max bg-white">
                  <button 
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    –
                  </button>
                  <span className="w-10 text-center text-md font-medium text-gray-800">{quantity}</span>
                  <button 
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none"
                    onClick={() => handleQuantityChange(1)}
                    aria-label="Increase quantity"
                    disabled={currentStockForDisplay !== undefined && quantity >= currentStockForDisplay}
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-auto pt-4 border-t border-gray-200">
                <button
                  onClick={handleAddToCart}
                  disabled={currentStockForDisplay === 0}
                  className="w-full flex items-center justify-center bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors font-semibold text-sm focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart size={18} className="mr-2" />
                  {currentStockForDisplay === 0 ? 'Out of Stock' : 'Add To Cart'}
                </button>
                
                <button 
                  className="w-full flex items-center justify-center border border-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-100 hover:border-gray-400 transition-colors font-semibold text-sm focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
                  aria-label="Add to Wishlist"
                  onClick={() => toast.success('Added to wishlist (dummy)!')} // Placeholder
                >
                  <Heart size={18} className="mr-2" />
                  Add to Wishlist
                </button>
              </div>
               {/* Share Button Placeholder */}
                <div className="mt-4 text-center">
                    <button className="text-sm text-gray-500 hover:text-primary-600 inline-flex items-center">
                        <Share2 size={14} className="mr-1.5" /> Share this product
                    </button>
                </div>
            </div>
          </div>
        </div>
        
        {/* Tabs Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200 sticky top-0 bg-white z-10"> {/* Make tabs sticky if page scrolls */}
            <nav className="flex -mb-px overflow-x-auto">
              {(['product-details', 'information', 'reviews'] as TabType[]).map(tab => (
                 <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-3 px-5 font-semibold text-sm border-b-2 whitespace-nowrap
                      ${activeTab === tab
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                     transition-colors focus:outline-none focus:ring-1 focus:ring-primary-400 rounded-t-md`}
                  >
                    {tab === 'product-details' ? 'Description' : tab === 'information' ? 'Specifications' : 'Reviews'}
                  </button>
              ))}
            </nav>
          </div>
          
          <div className="p-4 sm:p-6">
            {renderTabContent()}
          </div>
        </div>

        {/* TODO: Related Products Section */}
        {/* <div className="mt-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">You Might Also Like</h2>
            // Placeholder for related products carousel or grid
        </div> */}
      </div>
    </div>
  );
};

export default ProductDetail;