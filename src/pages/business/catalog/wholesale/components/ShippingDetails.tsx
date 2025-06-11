import React, { useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface ShippingUnit {
  value: string;
  label: string;
  conversion: number; // conversion factor to base unit (kg for weight, cm for dimensions)
}

interface ShippingDetailsProps {
  productId: number;
  weight: string;
  weightUnit: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
  dimensionUnit: string;
  shippingClass: string;
  onShippingChange: (field: 'weight' | 'weightUnit' | 'dimensionUnit' | 'shippingClass' | 'length' | 'width' | 'height' | 'shippingClassId', value: string) => void;
  onDimensionsChange: (field: 'length' | 'width' | 'height', value: string) => void;
  errors?: {
    weight?: string;
    dimensions?: {
      length?: string;
      width?: string;
      height?: string;
    };
    shippingClass?: string;
  };
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

const shippingClasses = [
  { value: 'standard', label: 'Standard Shipping' },
  { value: 'express', label: 'Express Shipping' },
  { value: 'overnight', label: 'Overnight Shipping' },
  { value: 'free', label: 'Free Shipping' }
];

const ShippingDetails: React.FC<ShippingDetailsProps> = ({
  productId,
  weight,
  weightUnit,
  dimensions,
  dimensionUnit,
  shippingClass,
  onShippingChange,
  onDimensionsChange,
  errors = {},
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleUpdateShipping = async () => {
    if (!productId || typeof productId !== 'number' || isNaN(productId)) {
      console.error('Invalid product ID in handleUpdateShipping:', productId);
      setError('Invalid product ID. Please try again.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      // Convert to base units (kg and cm) before sending to API
      const shippingData = {
        weight: convertToBaseUnit(weight, weightUnit, weightUnits),
        dimensions: {
          length: convertToBaseUnit(dimensions.length, dimensionUnit, dimensionUnits),
          width: convertToBaseUnit(dimensions.width, dimensionUnit, dimensionUnits),
          height: convertToBaseUnit(dimensions.height, dimensionUnit, dimensionUnits),
        },
        shipping_class: shippingClass
      };

      console.log('Sending shipping data for product:', productId, shippingData);

      const response = await fetch(`${API_BASE_URL}/api/merchant-dashboard/products/${productId}/shipping`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shippingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update shipping details');
      }

      const updatedData = await response.json();
      console.log('Shipping update response:', updatedData);
      
      setSuccess('Shipping details updated successfully');
    } catch (error) {
      console.error('Error updating shipping details:', error);
      setError('Failed to update shipping details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const convertToBaseUnit = (value: string, unit: string, units: ShippingUnit[]): number => {
    const numericValue = parseFloat(value) || 0;
    const unitConfig = units.find(u => u.value === unit);
    if (!unitConfig) return numericValue;
    return numericValue * unitConfig.conversion;
  };

  const convertFromBaseUnit = (value: number, unit: string, units: ShippingUnit[]): number => {
    if (!value || isNaN(value)) return 0;
    const unitConfig = units.find(u => u.value === unit);
    if (!unitConfig) return value;
    return value / unitConfig.conversion;
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

      {/* Weight */}
      <div>
        <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
          Weight
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            type="number"
            id="weight"
            value={weight}
            onChange={(e) => onShippingChange('weight', e.target.value)}
            step="0.001"
            min="0"
            className={`flex-1 rounded-l-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
              errors.weight ? 'border-red-300' : ''
            }`}
            placeholder="Enter product weight"
          />
          <select
            value={weightUnit}
            onChange={(e) => onShippingChange('weightUnit', e.target.value)}
            className="rounded-r-md border-l-0 border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            {weightUnits.map(unit => (
              <option key={unit.value} value={unit.value}>
                {unit.label}
              </option>
            ))}
          </select>
        </div>
        {errors.weight && (
          <p className="mt-1 text-sm text-red-600">{errors.weight}</p>
        )}
      </div>

      {/* Dimensions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Dimensions
        </label>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="length" className="block text-xs text-gray-500 mb-1">
              Length
            </label>
            <input
              type="number"
              id="length"
              value={dimensions.length}
              onChange={(e) => onDimensionsChange('length', e.target.value)}
              step="0.01"
              min="0"
              className={`block w-full rounded-md shadow-sm sm:text-sm ${
                errors.dimensions?.length
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
              }`}
              placeholder="Length"
            />
            {errors.dimensions?.length && (
              <p className="mt-1 text-sm text-red-600">{errors.dimensions.length}</p>
            )}
          </div>
          <div>
            <label htmlFor="width" className="block text-xs text-gray-500 mb-1">
              Width
            </label>
            <input
              type="number"
              id="width"
              value={dimensions.width}
              onChange={(e) => onDimensionsChange('width', e.target.value)}
              step="0.01"
              min="0"
              className={`block w-full rounded-md shadow-sm sm:text-sm ${
                errors.dimensions?.width
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
              }`}
              placeholder="Width"
            />
            {errors.dimensions?.width && (
              <p className="mt-1 text-sm text-red-600">{errors.dimensions.width}</p>
            )}
          </div>
          <div>
            <label htmlFor="height" className="block text-xs text-gray-500 mb-1">
              Height
            </label>
            <input
              type="number"
              id="height"
              value={dimensions.height}
              onChange={(e) => onDimensionsChange('height', e.target.value)}
              step="0.01"
              min="0"
              className={`block w-full rounded-md shadow-sm sm:text-sm ${
                errors.dimensions?.height
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
              }`}
              placeholder="Height"
            />
            {errors.dimensions?.height && (
              <p className="mt-1 text-sm text-red-600">{errors.dimensions.height}</p>
            )}
          </div>
        </div>
        <div className="mt-2">
          <select
            value={dimensionUnit}
            onChange={(e) => onShippingChange('dimensionUnit', e.target.value)}
            className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            {dimensionUnits.map(unit => (
              <option key={unit.value} value={unit.value}>
                {unit.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Shipping Class */}
      <div>
        <label htmlFor="shippingClass" className="block text-sm font-medium text-gray-700">
          Shipping Class
        </label>
        <div className="mt-1">
          <select
            id="shippingClass"
            value={shippingClass}
            onChange={(e) => onShippingChange('shippingClass', e.target.value)}
            className={`block w-full rounded-md shadow-sm sm:text-sm ${
              errors.shippingClass
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
            }`}
          >
            <option value="">Select a shipping class</option>
            {shippingClasses.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.shippingClass && (
            <p className="mt-1 text-sm text-red-600">{errors.shippingClass}</p>
          )}
        </div>
      </div>

      {/* Shipping Calculator Preview */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Shipping Calculator Preview
        </h4>
        <div className="space-y-2">
          <div className="text-sm text-gray-600">
            Weight: {convertToBaseUnit(weight, weightUnit, weightUnits).toFixed(2)} kg
          </div>
          <div className="text-sm text-gray-600">
            Dimensions: {convertToBaseUnit(dimensions.length, dimensionUnit, dimensionUnits).toFixed(2)} x {convertToBaseUnit(dimensions.width, dimensionUnit, dimensionUnits).toFixed(2)} x {convertToBaseUnit(dimensions.height, dimensionUnit, dimensionUnits).toFixed(2)} cm
          </div>
          <div className="text-sm text-gray-600">
            Shipping Class: {shippingClasses.find(c => c.value === shippingClass)?.label || 'Not selected'}
          </div>
        </div>
      </div>

      {/* Update Button */}
      <div className="flex justify-end">
        <button
          onClick={handleUpdateShipping}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Updating...' : 'Update Shipping'}
        </button>
      </div>
    </div>
  );
};

export default ShippingDetails; 