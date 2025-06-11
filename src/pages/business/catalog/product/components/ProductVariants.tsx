import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon, XMarkIcon, CloudArrowUpIcon, PlayIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/outline';
import { useDropzone } from 'react-dropzone';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface AttributeValue {
  value_code: string;
  value_label: string;
}

interface Attribute {
  attribute_id: number;
  name: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'boolean';
  options: string[] | null;
  required: boolean;
  help_text: string | null;
  values?: AttributeValue[];
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
  attributes: Record<number, string | string[]>;
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
  baseSku: string;
}

interface AddVariantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (variantData: {
    sku: string;
    price: string;
    stock: string;
    attributes: Record<number, string | string[]>;
  }) => void;
  categoryId: number | null;
  baseSku: string;
}

const AddVariantModal: React.FC<AddVariantModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  categoryId,
  baseSku,
}) => {
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<number, string | string[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (categoryId) {
      fetchAttributes(categoryId);
    }
  }, [categoryId]);

  useEffect(() => {
    if (baseSku && Object.keys(selectedAttributes).length > 0) {
      const attributeValues = Object.entries(selectedAttributes)
        .map(([_, value]) => {
          if (Array.isArray(value)) {
            return value.map(v => v.slice(0, 3).toUpperCase()).join('-');
          }
          return value.slice(0, 3).toUpperCase();
        })
        .join('-');
      
      setSku(`${baseSku}-${attributeValues}`);
    } else {
      setSku(baseSku || '');
    }
  }, [selectedAttributes, baseSku]);

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
      const attributesWithValues = await Promise.all(
        data.map(async (attr: Attribute) => {
          if (attr.type === 'select' || attr.type === 'multiselect') {
            const valuesResponse = await fetch(
              `${API_BASE_URL}/api/merchant-dashboard/attributes/${attr.attribute_id}/values`,
              {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                  'Content-Type': 'application/json',
                },
              }
            );
            if (valuesResponse.ok) {
              const values = await valuesResponse.json();
              return { ...attr, values };
            }
          }
          return attr;
        })
      );
      setAttributes(attributesWithValues);
    } catch (error) {
      console.error('Error fetching attributes:', error);
      setError('Failed to load attributes. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttributeSelect = (attribute: Attribute, value: string) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      sku,
      price,
      stock,
      attributes: selectedAttributes,
    });
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-gray-50"
                required
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">
                SKU is automatically generated based on base SKU and selected attributes
              </p>
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

          {/* Attributes Section */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Attributes</h3>
            <div className="space-y-4">
              {attributes.map((attribute) => (
                <div key={attribute.attribute_id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{attribute.name}</h4>
                      {attribute.required && (
                        <span className="text-xs text-red-600">Required</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-2">
                    {attribute.type === 'multiselect' ? (
                      <div className="space-y-2">
                        {attribute.options?.map((option, index) => {
                          const selectedValues = (selectedAttributes[attribute.attribute_id] as string[]) || [];
                          const isSelected = selectedValues.includes(option);
                          return (
                            <div
                              key={index}
                              className={`px-3 py-2 rounded-md cursor-pointer flex items-center ${
                                isSelected ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50'
                              }`}
                              onClick={() => handleAttributeSelect(attribute, option)}
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
                    ) : attribute.type === 'select' ? (
                      <div className="space-y-2">
                        {attribute.options?.map((option, index) => (
                          <div
                            key={index}
                            className={`px-3 py-2 rounded-md cursor-pointer ${
                              selectedAttributes[attribute.attribute_id] === option
                                ? 'bg-primary-50 text-primary-700'
                                : 'hover:bg-gray-50'
                            }`}
                            onClick={() => handleAttributeSelect(attribute, option)}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                    ) : attribute.type === 'number' ? (
                      <input
                        type="number"
                        value={selectedAttributes[attribute.attribute_id] as string || ''}
                        onChange={(e) => handleAttributeSelect(attribute, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    ) : (
                      <input
                        type="text"
                        value={selectedAttributes[attribute.attribute_id] as string || ''}
                        onChange={(e) => handleAttributeSelect(attribute, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
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
  baseSku,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mediaStats, setMediaStats] = useState<{[key: string]: any}>({});
  const [isUploading, setIsUploading] = useState<{[key: string]: boolean}>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    if (productId) {
      fetchVariants();
    }
  }, [productId]);

  const fetchVariants = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Only fetch variants if there are existing variants
      if (variants.length > 0) {
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
          variant_id: variant.product_id,
          id: variant.product_id.toString(),
          sku: variant.sku || '',
          price: variant.selling_price?.toString() || '',
          stock: variant.stock_qty?.toString() || '',
          attributes: variant.attributes || {},
          media: variant.media || []
        }));

        onVariantsChange(formattedVariants);
      }
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
    attributes: Record<number, string | string[]>;
  }) => {
    try {
      setIsLoading(true);
      setError(null);

      const newVariant = {
        sku: variantData.sku,
        stock_qty: parseInt(variantData.stock),
        selling_price: parseFloat(variantData.price),
        attributes: Object.fromEntries(
          Object.entries(variantData.attributes).map(([key, value]) => [
            parseInt(key),
            value
          ])
        )
      };

      const response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/products/${productId}/variants`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newVariant),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create variant');
      }

      const createdVariant = await response.json();
      const newProductId = createdVariant.product_id;
      
      // Format the variant data for the frontend
      const formattedVariant = {
        variant_id: newProductId,
        id: newProductId.toString(),
        sku: createdVariant.sku,
        price: createdVariant.selling_price.toString(),
        stock: createdVariant.stock?.stock_qty?.toString() || '0',
        attributes: createdVariant.attributes || {},
        media: []
      };

      // Add the new variant to the list
      onVariantsChange([...variants, formattedVariant]);
      
      // Fetch media stats for the new variant
      await fetchMediaStats(newProductId);

      setSuccess('Variant created successfully');
      setIsModalOpen(false);

    } catch (error) {
      console.error('Error creating variant:', error);
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
        stock: field === 'stock' ? parseInt(value) || 0 : parseInt(variant.stock) || 0
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

  const fetchMediaStats = async (productId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/products/${productId}/media/stats`, {
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
        [productId]: stats
      }));
    } catch (error) {
      console.error('Error fetching media stats:', error);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[], productId: number) => {
    if (!productId) {
      setError('Product ID is required for media upload');
      return;
    }

    const stats = mediaStats[productId];
    if (!stats || stats.remaining_slots < acceptedFiles.length) {
      const errorMsg = `You can only upload up to ${stats?.remaining_slots || 0} more files.`;
      setError(errorMsg);
      return;
    }

    setIsUploading(prev => ({ ...prev, [productId]: true }));
    setError(null);

    let updatedVariants = [...variants];
    try {
      for (const file of acceptedFiles) {
        try {
          setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
          
          const formData = new FormData();
          formData.append('media_file', file);
          formData.append('type', file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE');
          formData.append('sort_order', '0');

          const response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/products/${productId}/media`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            },
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to upload ${file.name}`);
          }

          const newMedia = await response.json();
          // Update variants with new media
          updatedVariants = updatedVariants.map(v => {
            if (v.variant_id === productId) {
              return {
                ...v,
                media: [...(v.media || []), {
                  media_id: newMedia.media_id,
                  media_url: newMedia.url,
                  media_type: newMedia.type,
                  is_primary: newMedia.is_primary,
                  display_order: newMedia.sort_order
                }]
              };
            }
            return v;
          });
          onVariantsChange(updatedVariants);
          await fetchMediaStats(productId);
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          setError(`Failed to upload ${file.name}. Please try again.`);
        }
      }
    } finally {
      setIsUploading(prev => ({ ...prev, [productId]: false }));
      // Clear upload progress for this variant after a short delay
      setTimeout(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          acceptedFiles.forEach(f => { delete newProgress[f.name]; });
          return newProgress;
        });
      }, 1000);
    }
  }, [variants, mediaStats, onVariantsChange]);

  const removeMedia = async (productId: number, mediaId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/products/media/${mediaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete media');
      }

      const updatedVariants = variants.map(v => {
        if (v.variant_id === productId) {
          return {
            ...v,
            media: (v.media || []).filter(m => m.media_id !== mediaId)
          };
        }
        return v;
      });

      onVariantsChange(updatedVariants);
      await fetchMediaStats(productId);
    } catch (error) {
      console.error('Error deleting media:', error);
      setError('Failed to delete media. Please try again.');
    }
  };

  const handleSetPrimaryMedia = async (productId: number, mediaId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/products/${productId}/media/${mediaId}`, {
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
        if (v.variant_id === productId) {
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
                  className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm bg-gray-50 ${
                    errors.variants?.[variant.id]?.sku
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                  }`}
                  readOnly
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

              {/* Media Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {variant.media?.map((media) => (
                  <div key={media.media_id} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100">
                    {media.media_type.toLowerCase() === 'image' ? (
                      <img
                        src={media.media_url}
                        alt="Variant media"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="relative w-full h-full">
                        <video
                          src={media.media_url}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <PlayIcon className="h-12 w-12 text-white opacity-75" />
                        </div>
                      </div>
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
                          onClick={() => removeMedia(variant.variant_id!, media.media_id)}
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
                  <VariantDropzone
                    variantId={variant.variant_id!}
                    isUploading={isUploading[variant.variant_id || '']}
                    onDrop={onDrop}
                    disabled={isUploading[variant.variant_id || '']}
                  />
                )}
              </div>

              {/* Upload Progress */}
              {Object.entries(uploadProgress).map(([fileName, progress]) => (
                <div key={fileName} className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                  <p className="text-xs text-gray-500 mt-1">{fileName}</p>
                </div>
              ))}
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
        baseSku={baseSku}
      />
    </div>
  );
};

const VariantDropzone: React.FC<{
  variantId: number;
  isUploading: boolean;
  onDrop: (files: File[], variantId: number) => void;
  disabled: boolean;
}> = ({ variantId, isUploading, onDrop, disabled }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => onDrop(files, variantId),
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.mov', '.avi'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: disabled || isUploading,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center transition-colors ${
        disabled || isUploading
          ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
          : isDragActive
          ? 'border-primary-500 bg-primary-50 cursor-pointer'
          : 'border-gray-300 hover:border-primary-500 cursor-pointer'
      }`}
    >
      <input {...getInputProps()} />
      <CloudArrowUpIcon className={`h-8 w-8 ${disabled || isUploading ? 'text-gray-400' : 'text-gray-400'}`} />
      <span className="mt-2 text-sm text-gray-600">
        {isUploading
          ? 'Uploading...'
          : disabled
          ? 'Maximum files reached'
          : isDragActive
          ? 'Drop files here'
          : 'Click or drag files'}
      </span>
    </div>
  );
};

export default ProductVariants;