import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Brand {
  brand_id: number;
  name: string;
  slug: string;
  icon_url: string;
}

const Brands = () => {
  const navigate = useNavigate();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/brands/icons`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch brands');
      }

      const data = await response.json();
      setBrands(data);
    } catch (err) {
      console.error('Error fetching brands:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch brands');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-0">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Shop By Brands</h2>
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
      <section className="py-0">
        <div className="container mx-auto px-4">
          <div className="text-center text-red-500">
            <p>Error loading brands: {error}</p>
            <button 
              onClick={fetchBrands}
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
    <section className="py-0">
      <div className="container mx-auto px-4">
        {/* Brands header with navigation */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Shop By Brands</h2>
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

        {/* Brands slider */}
        <div className="flex space-x-4 overflow-x-auto pb-4 pt-2 pl-2">
          {brands.map((brand) => (
            <div
              key={brand.brand_id}
              onClick={() => {
                // Navigate to products page with brand filter
                navigate(`/all-products?brand=${brand.brand_id}`);
              }}
              className="flex-shrink-0 w-36 h-40 bg-[#f5f7f2] rounded-lg flex flex-col items-center justify-center text-center p-4 transition duration-200 hover:scale-105 hover:border-2 hover:border-orange-500 hover:relative cursor-pointer"
            >
              <div className="w-14 h-14 mb-4 flex items-center justify-center">
                {brand.icon_url ? (
                  <img
                    src={brand.icon_url}
                    alt={brand.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-3xl">🏷️</span>
                )}
              </div>
              <h3 className="font-medium">{brand.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Brands;