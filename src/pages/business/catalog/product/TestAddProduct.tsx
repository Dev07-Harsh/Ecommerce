import React from 'react';
import { useNavigate } from 'react-router-dom';

const TestAddProduct: React.FC = () => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate('/business/catalog/products');
  };
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Add Product Page</h1>
      <p className="mb-4">This is a test page to verify routing is working correctly.</p>
      <button
        onClick={handleBack}
        className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
      >
        Back to Products
      </button>
    </div>
  );
};

export default TestAddProduct; 