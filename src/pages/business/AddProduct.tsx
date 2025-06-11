import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Category = 'Clothing' | 'Electronics';

const categories = {
  Clothing: {
    Men: ['Shirts', 'Pants', 'Shoes'],
    Women: ['Dresses', 'Tops', 'Shoes'],
    Kids: ['Clothing', 'Shoes', 'Accessories']
  },
  Electronics: {
    Mobiles: ['Smartphones', 'Accessories'],
    Laptops: ['Gaming', 'Business', 'Student']
  }
} as const;

type SubCategory<C extends Category> = keyof typeof categories[C];
type ProductType<C extends Category, S extends SubCategory<C>> = (typeof categories[C][S])[number];

interface Product {
  name: string;
  description: string;
  price: string;
  compareAtPrice: string;
  sku: string;
  barcode: string;
  quantity: string;
  brand: string;
}

const AddProduct: React.FC = () => {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<Category | ''>('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [product, setProduct] = useState<Product>({
    name: '',
    description: '',
    price: '',
    compareAtPrice: '',
    sku: '',
    barcode: '',
    quantity: '',
    brand: ''
  });

  const navigate = useNavigate();

  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setStep((prev) => prev + 1);

  const handleSave = () => {
    console.log({
      category: selectedCategory,
      subCategory: selectedSubCategory,
      type: selectedType,
      ...product,
    });
    navigate('/business/products');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Add New Product</h1>
        <div className="flex space-x-3">
            <button
            onClick={() => navigate('/business/catalog/products')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
            Cancel
            </button>
            <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
            Save Product
            </button>
        </div>
        </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Product Name
                  </label>
          <input
            type="text"
                    name="name"
                    id="name"
            value={product.name}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows={3}
                    value={product.description}
                    onChange={(e) => setProduct({ ...product, description: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                    Price
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      name="price"
                      id="price"
                      value={product.price}
                      onChange={(e) => setProduct({ ...product, price: e.target.value })}
                      className="block w-full pl-7 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                      placeholder="0.00"
          />
                  </div>
                </div>
                <div>
                  <label htmlFor="compareAtPrice" className="block text-sm font-medium text-gray-700">
                    Compare at Price
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
          <input
            type="number"
                      name="compareAtPrice"
                      id="compareAtPrice"
                      value={product.compareAtPrice}
                      onChange={(e) => setProduct({ ...product, compareAtPrice: e.target.value })}
                      className="block w-full pl-7 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Inventory</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
                    SKU
                  </label>
                  <input
                    type="text"
                    name="sku"
                    id="sku"
                    value={product.sku}
                    onChange={(e) => setProduct({ ...product, sku: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="barcode" className="block text-sm font-medium text-gray-700">
                    Barcode
                  </label>
                  <input
                    type="text"
                    name="barcode"
                    id="barcode"
                    value={product.barcode}
                    onChange={(e) => setProduct({ ...product, barcode: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
          />
                </div>
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    id="quantity"
                    value={product.quantity}
                    onChange={(e) => setProduct({ ...product, quantity: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Organization */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Organization</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    name="category"
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value as Category);
                      handleNext();
                    }}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  >
                    <option value="">Select a category</option>
                    {Object.keys(categories).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
                    Brand
                  </label>
                  <select
                    name="brand"
                    id="brand"
                    value={product.brand}
                    onChange={(e) => setProduct({ ...product, brand: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  >
                    <option value="">Select a brand</option>
                    {/* Add brand options here */}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;

