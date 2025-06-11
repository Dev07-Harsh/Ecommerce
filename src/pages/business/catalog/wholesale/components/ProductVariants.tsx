import React, { useState, useEffect } from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/outline';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface VariantAttribute {
  name: string;
}

interface VariantMedia {
  media_id: number;
  media_url: string;
  media_type: string;
  is_primary: boolean;
  display_order: number;
}

interface Variant {
  variant_id?: number;
  id: string;
  sku: string;
  price: string;
  stock: string;
  attributes: VariantAttribute[];
  media?: VariantMedia[];
}

interface ProductVariantsProps {
  productId: number;
  variants: Variant[];
  onVariantsChange: (variants: Variant[]) => void;
  errors?: {
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
  };
  categoryId: number | null;
}

interface Attribute {
  attribute_id: number;
  name: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'boolean';
  options: string[] | null;
  required: boolean;
  help_text: string | null;
}

interface AddVariantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (variantData: {
    sku: string;
    price: string;
    stock: string;
    attributes: Array<{ name: string }>;
  }) => void;
  categoryId: number | null;
}

const AddVariantModal: React.FC<AddVariantModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  categoryId,
}) => {
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<number, string | string[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedAttributes, setExpandedAttributes] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (categoryId) {
      fetchAttributes(categoryId);
    } else {
      setAttributes([]);
    }
  }, [categoryId]);

  const fetchAttributes = async (categoryId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/categories/${categoryId}/attributes`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch attributes');
      }

      const data = await response.json();
      setAttributes(data);
    } catch (error) {
      console.error('Error fetching attributes:', error);
      setError('Failed to load attributes. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAttribute = (attributeId: number) => {
    setExpandedAttributes(prev => {
      const next = new Set(prev);
      if (next.has(attributeId)) {
        next.delete(attributeId);
      } else {
        next.add(attributeId);
      }
      return next;
    });
  };

  const handleValueSelect = (attribute: Attribute, value: string) => {
    if (attribute.type === 'multiselect') {
      const currentValues = (selectedAttributes[attribute.attribute_id] as string[]) || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      setSelectedAttributes(prev => ({
        ...prev,
        [attribute.attribute_id]: newValues
      }));
    } else {
      setSelectedAttributes(prev => ({
        ...prev,
        [attribute.attribute_id]: value
      }));
    }
  };

  const renderAttributeValue = (attribute: Attribute) => {
    switch (attribute.type) {
      case 'multiselect':
        return (
          <div className="mt-2 space-y-2">
            {attribute.options?.map((option, index) => {
              const selectedValues = (selectedAttributes[attribute.attribute_id] as string[]) || [];
              const isSelected = selectedValues.includes(option);
              return (
                <div
                  key={index}
                  className={`px-3 py-2 rounded-md cursor-pointer flex items-center ${
                    isSelected ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleValueSelect(attribute, option)}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  {option}
                </div>
              );
            })}
          </div>
        );

      case 'select':
        return (
          <div className="mt-2 space-y-2">
            {attribute.options?.map((option, index) => (
              <div
                key={index}
                className={`px-3 py-2 rounded-md cursor-pointer ${
                  selectedAttributes[attribute.attribute_id] === option
                    ? 'bg-primary-50 text-primary-700'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleValueSelect(attribute, option)}
              >
                {option}
              </div>
            ))}
          </div>
        );

      case 'number':
        return (
          <div className="mt-2">
            <input
              type="number"
              value={selectedAttributes[attribute.attribute_id] as string || ''}
              onChange={(e) => handleValueSelect(attribute, e.target.value)}
              placeholder={`Enter ${attribute.name.toLowerCase()}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        );

      case 'boolean':
        return (
          <div className="mt-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={selectedAttributes[attribute.attribute_id] === 'true'}
                onChange={(e) => handleValueSelect(attribute, e.target.checked.toString())}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-gray-700">Yes</span>
            </label>
          </div>
        );

      default: // text
        return (
          <div className="mt-2">
            <input
              type="text"
              value={selectedAttributes[attribute.attribute_id] as string || ''}
              onChange={(e) => handleValueSelect(attribute, e.target.value)}
              placeholder={`Enter ${attribute.name.toLowerCase()}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert selected attributes to the required format
    const formattedAttributes = Object.entries(selectedAttributes).map(([attributeId, value]) => {
      const attribute = attributes.find(attr => attr.attribute_id === parseInt(attributeId));
      return {
        name: attribute?.name || ''
      };
    });

    onAdd({
      sku,
      price,
      stock,
      attributes: formattedAttributes,
    });

    // Reset form
    setSku('');
    setPrice('');
    setStock('');
    setSelectedAttributes({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Add New Variant</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
                SKU
              </label>
              <input
                type="text"
                id="sku"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Price
              </label>
              <input
                type="number"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                step="0.01"
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                Stock
              </label>
              <input
                type="number"
                id="stock"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Attributes</h3>
            
            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : error ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{error}</p>
              </div>
            ) : attributes.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No attributes available for this category
              </div>
            ) : (
              <div className="space-y-4">
                {attributes.map((attribute) => (
                  <div key={attribute.attribute_id} className="border rounded-lg overflow-hidden">
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleAttribute(attribute.attribute_id)}
                    >
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{attribute.name}</h3>
                        {attribute.required && (
                          <span className="text-xs text-red-600">Required</span>
                        )}
                        {attribute.help_text && (
                          <p className="text-xs text-gray-500 mt-1">{attribute.help_text}</p>
                        )}
                      </div>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        {expandedAttributes.has(attribute.attribute_id) ? (
                          <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronRightIcon className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                    </div>
                    {expandedAttributes.has(attribute.attribute_id) && (
                      <div className="px-4 pb-4">
                        {renderAttributeValue(attribute)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Add Variant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProductVariants: React.FC<ProductVariantsProps> = ({
  productId,
  variants,
  onVariantsChange,
  errors = {},
  categoryId,
}) => {
  const [newAttributeName, setNewAttributeName] = useState('');
  const [newAttributeValue, setNewAttributeValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVariantForMedia, setSelectedVariantForMedia] = useState<string | null>(null);
  const [mediaStats, setMediaStats] = useState<{[key: string]: any}>({});
  const [isUploading, setIsUploading] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    if (productId) {
      fetchVariants();
    }
  }, [productId]);

  const fetchVariants = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/products/${productId}/variants`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch variants');
      }

      const data = await response.json();
      const formattedVariants = data.map((variant: any) => ({
        variant_id: variant.variant_id,
        id: variant.variant_id.toString(),
        sku: variant.sku || '',
        price: variant.price?.toString() || '',
        stock: variant.stock?.toString() || '',
        attributes: Object.entries(variant.attributes || {}).map(([name, value]) => ({
          name,
          value: value as string
        })),
        media: variant.media?.map((media: any) => ({
          media_id: media.media_id,
          media_url: media.media_url,
          media_type: media.media_type,
          is_primary: media.is_primary,
          display_order: media.display_order
        }))
      }));

      onVariantsChange(formattedVariants);
    } catch (error) {
      console.error('Error fetching variants:', error);
      setError('Failed to load variants. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVariant = async (variantData: {
    sku: string;
    price: string;
    stock: string;
    attributes: Array<{ name: string }>;
  }) => {
    try {
      setIsLoading(true);
      setError(null);

      // Debug: Log input data
      console.log('Variant Data Input:', variantData);

      // Ensure we have the required fields
      if (!variantData.sku || !variantData.attributes[0]?.name) {
        throw new Error('SKU and attribute are required');
      }

      const newVariant = {
        sku: variantData.sku,
        attribute: variantData.attributes[0].name,
        price: variantData.price // Send as string
      };

      // Debug: Log request payload
      console.log('Request Payload:', newVariant);

      // Fix double slash in URL
      const url = `${API_BASE_URL}/api/merchant-dashboard/products/${productId}/variants`.replace(/([^:]\/)\/+/g, "$1");
      console.log('Request URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newVariant),
      });

      // Debug: Log response status
      console.log('Response Status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        // Debug: Log error response
        console.error('Error Response:', errorData);
        throw new Error(errorData.message || 'Failed to create variant');
      }

      const createdVariant = await response.json();
      // Debug: Log successful response
      console.log('Created Variant:', createdVariant);
      
      const formattedVariant = {
        variant_id: createdVariant.variant_id,
        id: createdVariant.variant_id.toString(),
        sku: createdVariant.sku || '',
        price: createdVariant.price?.toString() || '0.00',
        stock: createdVariant.stock?.toString() || '0',
        attributes: [{ name: createdVariant.attribute }],
        media: createdVariant.media?.map((media: any) => ({
          media_id: media.media_id,
          media_url: media.media_url,
          media_type: media.media_type,
          is_primary: media.is_primary,
          display_order: media.display_order
        }))
      };

      onVariantsChange([...variants, formattedVariant]);
      setSuccess('Variant created successfully');
      setIsModalOpen(false);
    } catch (error) {
      // Debug: Log full error details
      console.error('Full Error Details:', error);
      console.error('Error Stack:', error instanceof Error ? error.stack : 'No stack trace');
      setError(error instanceof Error ? error.message : 'Failed to create variant. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveVariant = async (variantId: string) => {
    const variant = variants.find(v => v.id === variantId);
    if (!variant?.variant_id) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/products/variants/${variant.variant_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete variant');
      }

      onVariantsChange(variants.filter((v) => v.id !== variantId));
      setSuccess('Variant deleted successfully');
    } catch (error) {
      console.error('Error deleting variant:', error);
      setError('Failed to delete variant. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVariantChange = async (
    variantId: string,
    field: keyof Variant,
    value: string
  ) => {
    const variant = variants.find(v => v.id === variantId);
    if (!variant?.variant_id) return;

    try {
      setIsLoading(true);
      setError(null);

      const updateData = {
        sku: field === 'sku' ? value : variant.sku,
        price: field === 'price' ? parseFloat(value) || 0 : parseFloat(variant.price) || 0,
        stock: field === 'stock' ? parseInt(value) || 0 : parseInt(variant.stock) || 0,
        attribute: variant.attributes[0]?.name || ''
      };

      const response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/products/variants/${variant.variant_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update variant');
      }

      onVariantsChange(
        variants.map((v) =>
          v.id === variantId ? { ...v, [field]: value } : v
        )
      );
      setSuccess('Variant updated successfully');
    } catch (error) {
      console.error('Error updating variant:', error);
      setError(error instanceof Error ? error.message : 'Failed to update variant. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAttribute = async (variantId: string) => {
    if (!newAttributeName || !newAttributeValue) return;

    const variant = variants.find(v => v.id === variantId);
    if (!variant?.variant_id) return;

    try {
      setIsLoading(true);
      setError(null);

      const updatedAttributes = [
        ...variant.attributes,
        { name: newAttributeName, value: newAttributeValue }
      ];

      const attributes = updatedAttributes.reduce((acc, attr) => ({
        ...acc,
        [attr.name]: attr.name

      }), {});

      const response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/products/variants/${variant.variant_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sku: variant.sku,
          price: parseFloat(variant.price) || 0,
          attributes
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update variant attributes');
      }

      onVariantsChange(
        variants.map((v) =>
          v.id === variantId
            ? {
                ...v,
                attributes: updatedAttributes,
              }
            : v
        )
      );

      setNewAttributeName('');
      setNewAttributeValue('');
      setSuccess('Attribute added successfully');
    } catch (error) {
      console.error('Error adding attribute:', error);
      setError('Failed to add attribute. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveAttribute = async (variantId: string, attributeName: string) => {
    const variant = variants.find(v => v.id === variantId);
    if (!variant?.variant_id) return;

    try {
      setIsLoading(true);
      setError(null);

      const updatedAttributes = variant.attributes.filter((a) => a.name !== attributeName);
      const attributes = updatedAttributes.reduce((acc, attr) => ({
        ...acc,
        [attr.name]: attr.name
      }), {});

      const response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/products/variants/${variant.variant_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sku: variant.sku,
          price: parseFloat(variant.price) || 0,
          attributes
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove attribute');
      }

      onVariantsChange(
        variants.map((v) =>
          v.id === variantId
            ? {
                ...v,
                attributes: updatedAttributes,
              }
            : v
        )
      );
      setSuccess('Attribute removed successfully');
    } catch (error) {
      console.error('Error removing attribute:', error);
      setError('Failed to remove attribute. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMediaStats = async (variantId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/products/variants/${variantId}/media/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch media stats');
      }

      const stats = await response.json();
      setMediaStats(prev => ({
        ...prev,
        [variantId]: stats
      }));
    } catch (error) {
      console.error('Error fetching media stats:', error);
    }
  };

  const handleMediaUpload = async (variantId: number, file: File) => {
    if (!variantId) return;

    setIsUploading(prev => ({ ...prev, [variantId]: true }));
    const formData = new FormData();
    formData.append('media_file', file);
    
    // Detect media type based on file type
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    
    if (!isVideo && !isImage) {
        setError('Invalid file type. Please upload an image or video.');
        setIsUploading(prev => ({ ...prev, [variantId]: false }));
        return;
    }
    
    formData.append('type', isVideo ? 'VIDEO' : 'IMAGE');
    formData.append('display_order', '0');
    formData.append('is_primary', 'false');

    try {
        const response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/products/variants/${variantId}/media`, {
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

        const newMedia = await response.json();
        const updatedVariants = variants.map(v => {
            if (v.variant_id === variantId) {
                return {
                    ...v,
                    media: [...(v.media || []), newMedia]
                };
            }
            return v;
        });

        onVariantsChange(updatedVariants);
        await fetchMediaStats(variantId);
    } catch (error) {
        console.error('Error uploading media:', error);
        setError(error instanceof Error ? error.message : 'Failed to upload media. Please try again.');
    } finally {
        setIsUploading(prev => ({ ...prev, [variantId]: false }));
    }
  };

  const handleDeleteMedia = async (variantId: number, mediaId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/products/variants/media/${mediaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete media');
      }

      const updatedVariants = variants.map(v => {
        if (v.variant_id === variantId) {
          return {
            ...v,
            media: (v.media || []).filter(m => m.media_id !== mediaId)
          };
        }
        return v;
      });

      onVariantsChange(updatedVariants);
      await fetchMediaStats(variantId);
    } catch (error) {
      console.error('Error deleting media:', error);
      setError('Failed to delete media. Please try again.');
    }
  };

  const handleSetPrimaryMedia = async (variantId: number, mediaId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/products/variants/${variantId}/media/${mediaId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_primary: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to update media');
      }

      const updatedVariants = variants.map(v => {
        if (v.variant_id === variantId) {
          return {
            ...v,
            media: (v.media || []).map(m => ({
              ...m,
              is_primary: m.media_id === mediaId
            }))
          };
        }
        return v;
      });

      onVariantsChange(updatedVariants);
    } catch (error) {
      console.error('Error updating media:', error);
      setError('Failed to update media. Please try again.');
    }
  };

  useEffect(() => {
    variants.forEach(variant => {
      if (variant.variant_id) {
        fetchMediaStats(variant.variant_id);
      }
    });
  }, [variants]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700">{success}</p>
        </div>
      )}

      {/* Variants List */}
      <div className="space-y-4">
        {variants.map((variant) => (
          <div
            key={variant.id}
            className="border rounded-lg p-4 space-y-4 bg-white"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Variant {variants.indexOf(variant) + 1}
              </h3>
              <button
                type="button"
                onClick={() => handleRemoveVariant(variant.id)}
                className="text-gray-400 hover:text-red-500"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor={`sku-${variant.id}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  SKU
                </label>
                <input
                  type="text"
                  id={`sku-${variant.id}`}
                  value={variant.sku}
                  onChange={(e) =>
                    handleVariantChange(variant.id, 'sku', e.target.value)
                  }
                  className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                    errors.variants?.[variant.id]?.sku
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                  }`}
                />
                {errors.variants?.[variant.id]?.sku && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.variants[variant.id].sku}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor={`price-${variant.id}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  Price
                </label>
                <input
                  type="number"
                  id={`price-${variant.id}`}
                  value={variant.price}
                  onChange={(e) =>
                    handleVariantChange(variant.id, 'price', e.target.value)
                  }
                  step="0.01"
                  min="0"
                  className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                    errors.variants?.[variant.id]?.price
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                  }`}
                />
                {errors.variants?.[variant.id]?.price && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.variants[variant.id].price}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor={`stock-${variant.id}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  Stock
                </label>
                <input
                  type="number"
                  id={`stock-${variant.id}`}
                  value={variant.stock}
                  onChange={(e) =>
                    handleVariantChange(variant.id, 'stock', e.target.value)
                  }
                  min="0"
                  className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                    errors.variants?.[variant.id]?.stock
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                  }`}
                />
                {errors.variants?.[variant.id]?.stock && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.variants[variant.id].stock}
                  </p>
                )}
              </div>
            </div>

            {/* Variant Media Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-gray-700">Media</h4>
                <div className="text-sm text-gray-500">
                  {mediaStats[variant.variant_id || '']?.remaining_slots || 0} slots remaining
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {variant.media?.map((media) => (
                  <div key={media.media_id} className="relative group">
                    {media.media_type === 'IMAGE' ? (
                      <img
                        src={media.media_url}
                        alt="Variant media"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ) : (
                      <video
                        src={media.media_url}
                        className="w-full h-32 object-cover rounded-lg"
                        controls
                      />
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                      <div className="hidden group-hover:flex space-x-2">
                        {!media.is_primary && (
                          <button
                            onClick={() => handleSetPrimaryMedia(variant.variant_id!, media.media_id)}
                            className="p-1 bg-white rounded-full hover:bg-gray-100"
                            title="Set as primary"
                          >
                            <StarIcon className="h-4 w-4 text-gray-600" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteMedia(variant.variant_id!, media.media_id)}
                          className="p-1 bg-white rounded-full hover:bg-gray-100"
                          title="Delete"
                        >
                          <XMarkIcon className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                    {media.is_primary && (
                      <div className="absolute top-2 right-2 bg-primary-600 text-white text-xs px-2 py-1 rounded">
                        Primary
                      </div>
                    )}
                  </div>
                ))}

                {mediaStats[variant.variant_id || '']?.remaining_slots > 0 && (
                  <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleMediaUpload(variant.variant_id!, file);
                        }
                      }}
                    />
                    <PlusIcon className="h-8 w-8 text-gray-400" />
                    <span className="mt-2 text-sm text-gray-600">Add Media</span>
                  </label>
                )}
              </div>
            </div>

            {/* Attributes */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700">Attributes</h4>
              <div className="space-y-2">
                {variant.attributes.map((attr) => (
                  <div
                    key={attr.name}
                    className="flex items-center space-x-2 bg-gray-50 p-2 rounded"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {attr.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttribute(variant.id, attr.name)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Attribute Form */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newAttributeName}
                  onChange={(e) => setNewAttributeName(e.target.value)}
                  placeholder="Attribute name"
                  className="block w-full rounded-md shadow-sm sm:text-sm border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                />
                <input
                  type="text"
                  value={newAttributeValue}
                  onChange={(e) => setNewAttributeValue(e.target.value)}
                  placeholder="Attribute value"
                  className="block w-full rounded-md shadow-sm sm:text-sm border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                />
                <button
                  type="button"
                  onClick={() => handleAddAttribute(variant.id)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Variant Button */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        <PlusIcon className="h-5 w-5 mr-2" />
        Add Variant
      </button>

      {/* Add Variant Modal */}
      <AddVariantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddVariant}
        categoryId={categoryId}
      />
    </div>
  );
};

export default ProductVariants;