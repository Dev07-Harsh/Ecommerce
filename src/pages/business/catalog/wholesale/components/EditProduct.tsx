import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import TaxCategorySelection from './TaxCategorySelection';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Category {
  category_id: number;
  name: string;
}

interface Brand {
  brand_id: number;
  name: string;
}

interface Media {
  media_id: number;
  url: string;
  type: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  public_id: string | null;
  product_id: number;
}

interface Shipping {
  product_id: number;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  shipping_class: string;
  free_shipping: boolean;
}

interface ProductStock {
  product_id: number;
  stock_qty: number;
  low_stock_threshold: number;
}

interface ShippingUnit {
  value: string;
  label: string;
  conversion: number; // conversion factor to base unit (kg for weight, cm for dimensions)
}

interface ProductMeta {
  product_id: number;
  short_desc: string;
  full_desc: string;
  meta_title: string;
  meta_desc: string;
  meta_keywords: string;
}

interface ProductTax {
  product_id: number;
  tax_rate: number;
}

interface Product {
  product_id: number;
  product_name: string;
  sku: string;
  category_id: number;
  brand_id: number;
  cost_price: number;
  selling_price: number;
  special_price: number | null;
  special_start: string | null;
  special_end: string | null;
  active_flag: boolean;
  category?: {
    category_id: number;
    name: string;
  };
  brand?: {
    brand_id: number;
    name: string;
  };
  media?: Media[];
  shipping?: Shipping;
  stock?: ProductStock;
  meta?: ProductMeta;
}

interface MediaStats {
  total_count: number;
  image_count: number;
  video_count: number;
  max_allowed: number;
  remaining_slots: number;
}

const weightUnits: ShippingUnit[] = [
  { value: 'kg', label: 'Kilograms (kg)', conversion: 1 },
  { value: 'g', label: 'Grams (g)', conversion: 0.001 },
  { value: 'lb', label: 'Pounds (lb)', conversion: 0.453592 },
  { value: 'oz', label: 'Ounces (oz)', conversion: 0.0283495 }
];

const dimensionUnits: ShippingUnit[] = [
  { value: 'cm', label: 'Centimeters (cm)', conversion: 1 },
  { value: 'mm', label: 'Millimeters (mm)', conversion: 0.1 },
  { value: 'in', label: 'Inches (in)', conversion: 2.54 },
  { value: 'ft', label: 'Feet (ft)', conversion: 30.48 }
];

const EditProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [mediaStats, setMediaStats] = useState<MediaStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stockData, setStockData] = useState<ProductStock | null>(null);
  const [formData, setFormData] = useState({
    product_name: '',
    sku: '',
    category_id: '',
    brand_id: '',
    cost_price: '',
    selling_price: '',
    special_price: '',
    special_start: '',
    special_end: '',
    active_flag: true,
    weight: '',
    weightUnit: 'kg',
    length: '',
    width: '',
    height: '',
    dimensionUnit: 'cm',
    stock_qty: '0',
    low_stock_threshold: '0'
  });
  const [shippingData, setShippingData] = useState({
    weight_kg: 0,
    length_cm: 0,
    width_cm: 0,
    height_cm: 0
  });
  const [metaData, setMetaData] = useState<ProductMeta>({
    product_id: 0,
    short_desc: '',
    full_desc: '',
    meta_title: '',
    meta_desc: '',
    meta_keywords: ''
  });
  const [taxData, setTaxData] = useState<ProductTax | null>(null);
  const [selectedTaxCategoryId, setSelectedTaxCategoryId] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      fetchCategories();
      fetchBrands();
      fetchProduct();
      fetchMediaStats();
      fetchShipping();
      fetchProductStock();
      fetchProductMeta();
      fetchProductTax();
    }
  }, [id]);

  const fetchCategories = async () => {
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
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/brands`, {
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
    }
  };

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch product data
      const productResponse = await fetch(`${API_BASE_URL}/api/merchant-dashboard/products/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!productResponse.ok) {
        throw new Error('Failed to fetch product');
      }

      const productData = await productResponse.json();

      // Fetch media data
      const mediaResponse = await fetch(`${API_BASE_URL}/api/merchant-dashboard/products/${id}/media`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!mediaResponse.ok) {
        throw new Error('Failed to fetch media');
      }

      const mediaData = await mediaResponse.json();
      console.log('Media data from API:', mediaData);

      // Combine product and media data
      const combinedData = {
        ...productData,
        media: mediaData
      };

      console.log('Combined data:', combinedData);
      console.log('Media type check:', mediaData.map((m: Media) => ({ id: m.media_id, type: m.type, url: m.url })));
      setProduct(combinedData);
      setFormData({
        product_name: productData.product_name,
        sku: productData.sku,
        category_id: productData.category_id.toString(),
        brand_id: productData.brand_id.toString(),
        cost_price: productData.cost_price.toString(),
        selling_price: productData.selling_price.toString(),
        special_price: productData.special_price?.toString() || '',
        special_start: productData.special_start || '',
        special_end: productData.special_end || '',
        active_flag: productData.active_flag,
        weight: productData.shipping?.weight?.toString() || '',
        length: productData.shipping?.dimensions?.length?.toString() || '',
        width: productData.shipping?.dimensions?.width?.toString() || '',
        height: productData.shipping?.dimensions?.height?.toString() || '',
        weightUnit: 'kg',
        dimensionUnit: 'cm',
        stock_qty: productData.stock?.stock_qty?.toString() || '0',
        low_stock_threshold: productData.stock?.low_stock_threshold?.toString() || '0',
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Failed to load product. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMediaStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/products/${id}/media/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch media stats');
      }

      const data = await response.json();
      console.log('Media stats received:', data);
      setMediaStats(data);
    } catch (error) {
      console.error('Error fetching media stats:', error);
      setError('Failed to load media stats. Please try again later.');
    }
  };

  const fetchShipping = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/products/${id}/shipping`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch shipping details');
      }

      const data = await response.json();
      console.log('Raw shipping data from API:', data);

      // Store the raw data
      setShippingData({
        weight_kg: parseFloat(data.weight_kg || '0'),
        length_cm: parseFloat(data.length_cm || '0'),
        width_cm: parseFloat(data.width_cm || '0'),
        height_cm: parseFloat(data.height_cm || '0')
      });

      // Update form data with converted values
      setFormData(prev => ({
        ...prev,
        weight: data.weight_kg || '0',
        length: data.length_cm || '0',
        width: data.width_cm || '0',
        height: data.height_cm || '0'
      }));

    } catch (error) {
      console.error('Error fetching shipping details:', error);
      setError('Failed to load shipping details. Please try again later.');
    }
  };

  const fetchProductStock = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/products/${id}/stock`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch product stock');
      }

      const data = await response.json();
      console.log('Stock data received:', data);
      
      // Update both stockData and formData
      setStockData(data);
      setFormData(prev => ({
        ...prev,
        stock_qty: data.stock_qty?.toString() || '0',
        low_stock_threshold: data.low_stock_threshold?.toString() || '0'
      }));
    } catch (error) {
      console.error('Error fetching product stock:', error);
      setError('Failed to load product stock. Please try again later.');
    }
  };

  const fetchProductMeta = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/products/${id}/meta`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch product meta');
      }

      const data = await response.json();
      setMetaData(data);
    } catch (error) {
      console.error('Error fetching product meta:', error);
      setError('Failed to load product meta. Please try again later.');
    }
  };

  const fetchProductTax = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/products/${id}/tax`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch product tax');
      }

      const data = await response.json();
      setTaxData(data);
    } catch (error) {
      console.error('Error fetching product tax:', error);
      setError('Failed to load product tax. Please try again later.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      setError('Invalid file type. Please upload an image or video.');
      return;
    }

    const formData = new FormData();
    formData.append('media_file', file);
    formData.append('type', isVideo ? 'VIDEO' : 'IMAGE');
    formData.append('sort_order', '0');

    try {
      const response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/products/${id}/media`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload media');
      }

      // Wait for both operations to complete
      await Promise.all([
        fetchProduct(),
        fetchMediaStats()
      ]);

      // Clear the file input
      e.target.value = '';
    } catch (error) {
      console.error('Error uploading media:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload media. Please try again.');
    }
  };

  const handleDeleteMedia = async (mediaId: number) => {
    if (!window.confirm('Are you sure you want to delete this media?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/products/media/${mediaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete media');
      }

      // Refresh product data and media stats
      fetchProduct();
      fetchMediaStats();
    } catch (error) {
      console.error('Error deleting media:', error);
      setError('Failed to delete media. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Convert empty strings to null for date fields
      const submitData = {
        ...formData,
        category_id: parseInt(formData.category_id),
        brand_id: parseInt(formData.brand_id),
        cost_price: parseFloat(formData.cost_price),
        selling_price: parseFloat(formData.selling_price),
        special_price: formData.special_price ? parseFloat(formData.special_price) : null,
        special_start: formData.special_start || null,
        special_end: formData.special_end || null,
        weight: parseFloat(formData.weight),
        length: parseFloat(formData.length),
        width: parseFloat(formData.width),
        height: parseFloat(formData.height),
      };

      const response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/products/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update product');
      }

      navigate('/business/catalog/products');
    } catch (error) {
      console.error('Error updating product:', error);
      setError(error instanceof Error ? error.message : 'Failed to update product. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleUpdateShipping = async () => {
    try {
      // Convert to base units (kg and cm) before sending to API
      const shippingData = {
        weight: convertToBaseUnit(formData.weight, formData.weightUnit, weightUnits),
        dimensions: {
          length: convertToBaseUnit(formData.length, formData.dimensionUnit, dimensionUnits),
          width: convertToBaseUnit(formData.width, formData.dimensionUnit, dimensionUnits),
          height: convertToBaseUnit(formData.height, formData.dimensionUnit, dimensionUnits),
        }
      };

      console.log('Sending shipping data:', shippingData);

      const response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/products/${id}/shipping`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shippingData),
      });

      if (!response.ok) {
        throw new Error('Failed to update shipping details');
      }

      // Refresh shipping data after successful update
      await fetchShipping();
    } catch (error) {
      console.error('Error updating shipping details:', error);
      setError('Failed to update shipping details. Please try again.');
    }
  };

  const handleUpdateStock = async () => {
    try {
      const stockUpdateData = {
        stock_qty: parseInt(formData.stock_qty),
        low_stock_threshold: parseInt(formData.low_stock_threshold),
      };

      console.log('Updating stock with data:', stockUpdateData);

      // First try PUT request
      let response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/products/${id}/stock`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stockUpdateData),
      });

      // If PUT fails, try POST request
      if (!response.ok) {
        console.log('PUT request failed, trying POST...');
        response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/products/${id}/stock`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(stockUpdateData),
        });
      }

      if (!response.ok) {
        throw new Error('Failed to update stock');
      }

      const updatedData = await response.json();
      console.log('Stock update response:', updatedData);
      
      // Update the form data with the response
      setFormData(prev => ({
        ...prev,
        stock_qty: updatedData.stock_qty?.toString() || '0',
        low_stock_threshold: updatedData.low_stock_threshold?.toString() || '0'
      }));
      
      // Refresh stock data
      await fetchProductStock();
    } catch (error) {
      console.error('Error updating stock:', error);
      setError('Failed to update stock. Please try again.');
    }
  };

  const handleUpdateMeta = async () => {
    try {
      // Create a copy of metaData without product_id
      const { product_id, ...metaDataToSend } = metaData;

      const response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/products/${id}/meta`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metaDataToSend),
      });

      if (!response.ok) {
        throw new Error('Failed to update meta data');
      }

      const updatedData = await response.json();
      setMetaData(updatedData);
    } catch (error) {
      console.error('Error updating meta data:', error);
      setError('Failed to update meta data. Please try again.');
    }
  };

  const handleTaxCategorySelect = async (taxCategoryId: number) => {
    setSelectedTaxCategoryId(taxCategoryId);
  };

  const convertFromBaseUnit = (value: number, unit: string, units: ShippingUnit[]): number => {
    if (!value || isNaN(value)) return 0;
    const unitConfig = units.find(u => u.value === unit);
    if (!unitConfig) return value;
    return value / unitConfig.conversion;
  };

  const convertToBaseUnit = (value: string, unit: string, units: ShippingUnit[]): number => {
    const numericValue = parseFloat(value) || 0;
    const unitConfig = units.find(u => u.value === unit);
    if (!unitConfig) return numericValue;
    return numericValue * unitConfig.conversion;
  };

  // Function to generate meta keywords from description
  const generateMetaKeywords = (text: string): string => {
    if (!text) return '';
    
    // Remove special characters and convert to lowercase
    const cleanText = text.toLowerCase().replace(/[^\w\s]/g, '');
    
    // Split into words and remove common words
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'as'];
    const words = cleanText.split(/\s+/).filter(word => 
      word.length > 3 && !commonWords.includes(word)
    );
    
    // Get unique words and limit to 10 keywords
    const uniqueWords = [...new Set(words)].slice(0, 10);
    
    return uniqueWords.join(', ');
  };

  // Function to handle description changes and auto-generate meta data
  const handleDescriptionChange = (field: 'short_desc' | 'full_desc', value: string) => {
    setMetaData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Generate meta title from short description
      if (field === 'short_desc') {
        updated.meta_title = value.slice(0, 100);
      }
      
      // Generate meta description from full description
      if (field === 'full_desc') {
        updated.meta_desc = value.slice(0, 255);
        // Generate keywords from full description
        updated.meta_keywords = generateMetaKeywords(value);
      }
      
      return updated;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">{error}</p>
        <button
          onClick={fetchProduct}
          className="mt-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate('/business/catalog/products')}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Products
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Edit Product</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="product_name" className="block text-sm font-medium text-gray-700">
                Product Name
              </label>
              <input
                type="text"
                id="product_name"
                name="product_name"
                value={formData.product_name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
                SKU
              </label>
              <input
                type="text"
                id="sku"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.category_id} value={category.category_id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="brand_id" className="block text-sm font-medium text-gray-700">
                Brand
              </label>
              <select
                id="brand_id"
                name="brand_id"
                value={formData.brand_id}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                required
              >
                <option value="">Select a brand</option>
                {brands.map((brand) => (
                  <option key={brand.brand_id} value={brand.brand_id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="cost_price" className="block text-sm font-medium text-gray-700">
                Cost Price
              </label>
              <input
                type="number"
                id="cost_price"
                name="cost_price"
                value={formData.cost_price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="selling_price" className="block text-sm font-medium text-gray-700">
                Selling Price
              </label>
              <input
                type="number"
                id="selling_price"
                name="selling_price"
                value={formData.selling_price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="special_price" className="block text-sm font-medium text-gray-700">
                Special Price
              </label>
              <input
                type="number"
                id="special_price"
                name="special_price"
                value={formData.special_price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="special_start" className="block text-sm font-medium text-gray-700">
                Special Price Start Date
              </label>
              <input
                type="date"
                id="special_start"
                name="special_start"
                value={formData.special_start}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="special_end" className="block text-sm font-medium text-gray-700">
                Special Price End Date
              </label>
              <input
                type="date"
                id="special_end"
                name="special_end"
                value={formData.special_end}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="active_flag"
                name="active_flag"
                checked={formData.active_flag}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="active_flag" className="ml-2 block text-sm text-gray-900">
                Active
              </label>
            </div>
          </div>
        </div>

        {/* Product Media Section */}
        <div className="mt-8 bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Product Media</h3>
              {mediaStats && (
                <p className="text-sm text-gray-500 mt-1">
                  {mediaStats.image_count} {mediaStats.image_count === 1 ? 'image' : 'images'}, {mediaStats.video_count} {mediaStats.video_count === 1 ? 'video' : 'videos'}
                  {mediaStats.remaining_slots > 0 && ` (${mediaStats.remaining_slots} ${mediaStats.remaining_slots === 1 ? 'slot' : 'slots'} remaining)`}
                </p>
              )}
            </div>
            {mediaStats && mediaStats.remaining_slots > 0 && (
              <div className="flex items-center space-x-2">
                <label
                  htmlFor="media-upload"
                  className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none cursor-pointer"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Media
                </label>
                <input
                  id="media-upload"
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {(() => {
            console.log('Current product state:', product);
            console.log('Media array:', product?.media);
            return null;
          })()}
          {product?.media && product.media.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {product.media.map((media) => (
                <div key={media.media_id} className="relative group bg-gray-50 rounded-lg overflow-hidden">
                  <div className="aspect-w-16 aspect-h-9">
                    {media.type.toLowerCase() === 'image' ? (
                      <img
                        src={media.url}
                        alt="Product media"
                        className="w-full h-full object-cover"
                      />
                    ) : media.type.toLowerCase() === 'video' ? (
                      <video
                        src={media.url}
                        className="w-full h-full object-cover"
                        controls
                      />
                    ) : null}
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        {media.type.toLowerCase() === 'image' ? 'Image' : 'Video'}
                      </span>
                      <span className="text-xs text-gray-500">
                        Order: {media.sort_order}
                      </span>
                    </div>
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={() => handleDeleteMedia(media.media_id)}
                        className="inline-flex items-center px-2 py-1 border border-transparent rounded-md text-xs font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                      >
                        <TrashIcon className="h-3 w-3 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="text-gray-400 mb-2">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-500">No media uploaded yet</p>
              {mediaStats && mediaStats.remaining_slots > 0 && (
                <p className="text-sm text-gray-400 mt-1">
                  Click "Add Media" to upload images or videos
                </p>
              )}
            </div>
          )}
        </div>

        {/* Shipping Section */}
        <div className="mt-8 bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Details</h3>
          
          {/* Current Values Display */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Current Weight</h4>
                <p className="text-lg font-semibold text-gray-900">
                  {shippingData.weight_kg} kg
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Current Dimensions</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-500">Length</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {shippingData.length_cm} cm
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Width</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {shippingData.width_cm} cm
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Height</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {shippingData.height_cm} cm
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                Weight
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  step="0.001"
                  min="0"
                  className="flex-1 rounded-l-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                />
                <select
                  name="weightUnit"
                  value={formData.weightUnit}
                  onChange={handleChange}
                  className="rounded-r-md border-l-0 border-gray-300 focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                >
                  {weightUnits.map(unit => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dimensions
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <input
                    type="number"
                    name="length"
                    value={formData.length}
                    onChange={handleChange}
                    placeholder="Length"
                    step="0.01"
                    min="0"
                    className="block w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    name="width"
                    value={formData.width}
                    onChange={handleChange}
                    placeholder="Width"
                    step="0.01"
                    min="0"
                    className="block w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    placeholder="Height"
                    step="0.01"
                    min="0"
                    className="block w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                  />
                </div>
              </div>
              <div className="mt-2">
                <select
                  name="dimensionUnit"
                  value={formData.dimensionUnit}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                >
                  {dimensionUnits.map(unit => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleUpdateShipping}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              Update Shipping
            </button>
          </div>
        </div>

        {/* Stock Section */}
        <div className="mt-8 bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Stock Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="stock_qty" className="block text-sm font-medium text-gray-700">
                Stock Quantity
              </label>
              <input
                type="number"
                id="stock_qty"
                name="stock_qty"
                value={stockData?.stock_qty || formData.stock_qty}
                onChange={handleChange}
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="low_stock_threshold" className="block text-sm font-medium text-gray-700">
                Low Stock Threshold
              </label>
              <input
                type="number"
                id="low_stock_threshold"
                name="low_stock_threshold"
                value={stockData?.low_stock_threshold || formData.low_stock_threshold}
                onChange={handleChange}
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleUpdateStock}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              Update Stock
            </button>
          </div>
        </div>

        {/* Product Meta Section */}
        <div className="mt-8 bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Product Meta Data</h3>
          
          <div className="space-y-6">
            {/* Short Description */}
            <div>
              <label htmlFor="short_desc" className="block text-sm font-medium text-gray-700">
                Short Description
              </label>
              <textarea
                id="short_desc"
                value={metaData.short_desc}
                onChange={(e) => handleDescriptionChange('short_desc', e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                placeholder="Enter a brief description (max 255 characters)"
                maxLength={255}
              />
            </div>

            {/* Full Description */}
            <div>
              <label htmlFor="full_desc" className="block text-sm font-medium text-gray-700">
                Full Description
              </label>
              <textarea
                id="full_desc"
                value={metaData.full_desc}
                onChange={(e) => handleDescriptionChange('full_desc', e.target.value)}
                rows={6}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                placeholder="Enter detailed product description"
              />
            </div>

            {/* Meta Title */}
            <div>
              <label htmlFor="meta_title" className="block text-sm font-medium text-gray-700">
                Meta Title
              </label>
              <input
                type="text"
                id="meta_title"
                value={metaData.meta_title}
                onChange={(e) => setMetaData(prev => ({ ...prev, meta_title: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                placeholder="Enter meta title (max 100 characters)"
                maxLength={100}
              />
            </div>

            {/* Meta Description */}
            <div>
              <label htmlFor="meta_desc" className="block text-sm font-medium text-gray-700">
                Meta Description
              </label>
              <textarea
                id="meta_desc"
                value={metaData.meta_desc}
                onChange={(e) => setMetaData(prev => ({ ...prev, meta_desc: e.target.value }))}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                placeholder="Enter meta description (max 255 characters)"
                maxLength={255}
              />
            </div>

            {/* Meta Keywords */}
            <div>
              <label htmlFor="meta_keywords" className="block text-sm font-medium text-gray-700">
                Meta Keywords
              </label>
              <input
                type="text"
                id="meta_keywords"
                value={metaData.meta_keywords}
                onChange={(e) => setMetaData(prev => ({ ...prev, meta_keywords: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                placeholder="Enter keywords separated by commas"
              />
              <p className="mt-1 text-sm text-gray-500">
                Keywords are automatically generated from the full description. You can modify them manually.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleUpdateMeta}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                Update Meta
              </button>
            </div>
          </div>
        </div>

        {/* Add Tax Category Section */}
        <div className="mt-8 bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tax Category</h3>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-1">Current Tax Rate</h4>
              <p className="text-lg font-semibold text-gray-900">
                {taxData ? `${taxData.tax_rate}%` : 'Not set'}
              </p>
            </div>
            <TaxCategorySelection
              selectedTaxCategoryId={selectedTaxCategoryId}
              onTaxCategorySelect={handleTaxCategorySelect}
              productId={id ? parseInt(id) : undefined}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/business/catalog/products')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;