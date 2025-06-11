import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Category {
  category_id: number;
  name: string;
  slug: string;
  icon_url: string;
}

const Categories: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/categories/with-icons`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="pt-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Shop By Categories</h2>
          </div>
          <div className="flex space-x-4 overflow-x-auto pb-4 pt-2 pl-2">
            {[...Array(6)].map((_, index) => (
              <div 
                key={index}
                className="flex-shrink-0 w-36 h-40 bg-gray-100 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="pt-8">
        <div className="container mx-auto px-4">
          <div className="text-red-500 text-center">
            <p>Error loading categories: {error}</p>
            <button 
              onClick={fetchCategories}
              className="mt-2 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-8">
      <div className="container mx-auto px-4">
        {/* Categories header with navigation */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Shop By Categories</h2>
          <div className="flex items-center">
            <Link to="/all-products" className="text-orange-500 text-sm font-medium mr-4">
              See All
            </Link>
            <div className="flex space-x-2">
              <button className="p-1 rounded-full border border-gray-300">
                <ChevronLeft size={20} />
              </button>
              <button className="p-1 rounded-full border border-gray-300">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Categories slider */}
        <div className="flex space-x-4 overflow-x-auto pb-4 pt-2 pl-2">
          {categories.map((category) => (
            <div 
              key={category.category_id} 
              onClick={() => {
                navigate(`/all-products?category=${category.category_id}`);
              }}
              className="flex-shrink-0 w-36 h-40 bg-[#f5f7f2] rounded-lg flex flex-col items-center justify-center text-center p-4 transition duration-200 hover:scale-105 hover:border-2 hover:border-orange-500 hover:relative cursor-pointer"
            >
              <div className="w-14 h-14 mb-4 flex items-center justify-center">
                {category.icon_url ? (
                  <img 
                    src={category.icon_url} 
                    alt={category.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-3xl">📦</span>
                )}
              </div>
              <h3 className="font-medium">{category.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;