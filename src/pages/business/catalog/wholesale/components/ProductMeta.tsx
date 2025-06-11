import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface ProductMetaProps {
  productId: number;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  shortDescription: string;
  fullDescription: string;
  onMetaChange: (field: string, value: string) => void;
  errors?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    shortDescription?: string;
    fullDescription?: string;
  };
}

const ProductMeta: React.FC<ProductMetaProps> = ({
  productId,
  metaTitle,
  metaDescription,
  metaKeywords,
  shortDescription,
  fullDescription,
  onMetaChange,
  errors = {},
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Quill editor modules configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link'],
      ['clean']
    ],
  };

  // Quill editor formats configuration
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'link'
  ];

  const handleUpdateMeta = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      // Validate required fields
      if (!shortDescription.trim()) {
        setError('Short description is required');
        return;
      }
      if (!fullDescription.trim()) {
        setError('Full description is required');
        return;
      }

      const metaData = {
        short_desc: shortDescription.trim(),
        full_desc: fullDescription.trim(),
        meta_title: metaTitle.trim(),
        meta_desc: metaDescription.trim(),
        meta_keywords: metaKeywords.trim()
      };

      const response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/products/${productId}/meta`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metaData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update meta data');
      }

      const updatedData = await response.json();
      setSuccess('Meta data updated successfully');
      
      // Update local state with the response data
      onMetaChange('shortDescription', updatedData.short_desc || '');
      onMetaChange('fullDescription', updatedData.full_desc || '');
      onMetaChange('metaTitle', updatedData.meta_title || '');
      onMetaChange('metaDescription', updatedData.meta_desc || '');
      onMetaChange('metaKeywords', updatedData.meta_keywords || '');
    } catch (error) {
      console.error('Error updating meta data:', error);
      setError(error instanceof Error ? error.message : 'Failed to update meta data. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
  const handleDescriptionChange = (field: 'shortDescription' | 'fullDescription', value: string) => {
    onMetaChange(field, value);
    
    // Generate meta title from short description
    if (field === 'shortDescription') {
      onMetaChange('metaTitle', value.slice(0, 100));
    }
    
    // Generate meta description and keywords from full description
    if (field === 'fullDescription') {
      onMetaChange('metaDescription', value.slice(0, 255));
      onMetaChange('metaKeywords', generateMetaKeywords(value));
    }
  };

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

      {/* Short Description */}
      <div>
        <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 mb-2">
          Short Description
        </label>
        <div className={`${errors.shortDescription ? 'border-red-300' : 'border-gray-300'} rounded-md`}>
          <ReactQuill
            value={shortDescription}
            onChange={(content) => handleDescriptionChange('shortDescription', content)}
            modules={modules}
            formats={formats}
            placeholder="Enter a brief description (max 255 characters)"
            className="h-32 mb-12"
          />
        </div>
        {errors.shortDescription && (
          <p className="mt-1 text-sm text-red-600">{errors.shortDescription}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          You can use formatting options like bold, italic, bullet points, etc.
        </p>
      </div>

      {/* Full Description */}
      <div>
        <label htmlFor="fullDescription" className="block text-sm font-medium text-gray-700 mb-2">
          Full Description
        </label>
        <div className={`${errors.fullDescription ? 'border-red-300' : 'border-gray-300'} rounded-md`}>
          <ReactQuill
            value={fullDescription}
            onChange={(content) => handleDescriptionChange('fullDescription', content)}
            modules={modules}
            formats={formats}
            placeholder="Enter detailed product description"
            className="h-64 mb-12"
          />
        </div>
        {errors.fullDescription && (
          <p className="mt-1 text-sm text-red-600">{errors.fullDescription}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Use the toolbar above to format your text with bullet points, headings, and other styles.
        </p>
      </div>

      {/* Meta Title */}
      <div>
        <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700">
          Meta Title
        </label>
        <input
          type="text"
          id="metaTitle"
          value={metaTitle}
          onChange={(e) => onMetaChange('metaTitle', e.target.value)}
          className={`block w-full rounded-md shadow-sm sm:text-sm ${
            errors.metaTitle
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
          }`}
          placeholder="Enter meta title (max 100 characters)"
          maxLength={100}
        />
        {errors.metaTitle && (
          <p className="mt-1 text-sm text-red-600">{errors.metaTitle}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Recommended length: 50-60 characters
        </p>
      </div>

      {/* Meta Description */}
      <div>
        <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700">
          Meta Description
        </label>
        <textarea
          id="metaDescription"
          rows={3}
          value={metaDescription}
          onChange={(e) => onMetaChange('metaDescription', e.target.value)}
          className={`block w-full rounded-md shadow-sm sm:text-sm ${
            errors.metaDescription
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
          }`}
          placeholder="Enter meta description (max 255 characters)"
          maxLength={255}
        />
        {errors.metaDescription && (
          <p className="mt-1 text-sm text-red-600">{errors.metaDescription}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Recommended length: 150-160 characters
        </p>
      </div>

      {/* Meta Keywords */}
      <div>
        <label htmlFor="metaKeywords" className="block text-sm font-medium text-gray-700">
          Meta Keywords
        </label>
        <input
          type="text"
          id="metaKeywords"
          value={metaKeywords}
          onChange={(e) => onMetaChange('metaKeywords', e.target.value)}
          className={`block w-full rounded-md shadow-sm sm:text-sm ${
            errors.metaKeywords
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
          }`}
          placeholder="Enter keywords separated by commas"
        />
        {errors.metaKeywords && (
          <p className="mt-1 text-sm text-red-600">{errors.metaKeywords}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Keywords are automatically generated from the full description. You can modify them manually.
        </p>
      </div>

      {/* SEO Preview */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h4 className="text-sm font-medium text-gray-700 mb-2">SEO Preview</h4>
        <div className="space-y-2">
          <div className="text-orange-600 text-sm truncate">
            {metaTitle || 'Your meta title will appear here'}
          </div>
          <div className="text-gray-600 text-xs line-clamp-2">
            {metaDescription || 'Your meta description will appear here'}
          </div>
        </div>
      </div>

      {/* Update Button */}
      <div className="flex justify-end">
        <button
          onClick={handleUpdateMeta}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Updating...' : 'Update Meta Data'}
        </button>
      </div>
    </div>
  );
};

export default ProductMeta; 