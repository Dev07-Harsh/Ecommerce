import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Folder, Tag } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category?: string;
  primary_image?: string;
}

interface Category {
  category_id: number;
  name: string;
  slug: string;
  icon_url?: string;
}

interface Brand {
  brand_id: number;
  name: string;
  slug: string;
  logo_url?: string;
}

interface SearchResultsProps {
  isVisible: boolean;
  searchQuery: string;
  searchType: 'all' | 'products' | 'categories' | 'brands';
  onItemClick?: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const SearchResults: React.FC<SearchResultsProps> = ({ 
  isVisible, 
  searchQuery, 
  searchType,
  onItemClick 
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery || searchQuery.length < 2) {
        setProducts([]);
        setCategories([]);
        setBrands([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const searchParams = new URLSearchParams({
          search: searchQuery,
          per_page: '5'
        });

        if (searchType === 'all' || searchType === 'products') {
          const productsResponse = await fetch(
            `${API_BASE_URL}/api/products?${searchParams}`,
            {
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            }
          );

          if (!productsResponse.ok) {
            throw new Error('Failed to fetch products');
          }

          const productsData = await productsResponse.json();
          setProducts(productsData.products || []);
        }

        if (searchType === 'all' || searchType === 'categories') {
          const categoriesResponse = await fetch(
            `${API_BASE_URL}/api/categories/?${searchParams}`,
            {
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            }
          );

          if (!categoriesResponse.ok) {
            throw new Error('Failed to fetch categories');
          }

          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData || []);
        }

        if (searchType === 'all' || searchType === 'brands') {
          const brandsResponse = await fetch(
            `${API_BASE_URL}/api/brands/?${searchParams}`,
            {
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            }
          );

          if (!brandsResponse.ok) {
            throw new Error('Failed to fetch brands');
          }

          const brandsData = await brandsResponse.json();
          setBrands(brandsData || []);
        }
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to fetch search results');
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSearchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, searchType]);

  if (!isVisible || !searchQuery) return null;

  return (
    <div className="absolute left-0 right-0 w-full bg-white shadow-lg rounded-b-md overflow-hidden z-50 border border-gray-200 border-t-0">
      {loading ? (
        <div className="p-4 text-center text-gray-500">Searching...</div>
      ) : error ? (
        <div className="p-4 text-center text-red-500">{error}</div>
      ) : (products.length > 0 || categories.length > 0 || brands.length > 0) ? (
        <div>
          <ul className="py-1 max-h-80 overflow-y-auto">
            {categories.length > 0 && (
              <>
                <li className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                  Categories
                </li>
                {categories.map((category) => (
                  <li key={category.category_id}>
                    <Link 
                      to={`/all-products?category=${category.category_id}`}
                      className="flex items-center px-4 py-2 hover:bg-gray-100 text-sm text-gray-800"
                      onClick={onItemClick}
                    >
                      {category.icon_url ? (
                        <img 
                          src={category.icon_url} 
                          alt={category.name}
                          className="w-8 h-8 object-cover rounded mr-2"
                        />
                      ) : (
                        <Folder className="w-4 h-4 mr-2 text-gray-500" />
                      )}
                      <span>{category.name}</span>
                    </Link>
                  </li>
                ))}
              </>
            )}
            
            {brands.length > 0 && (
              <>
                <li className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                  Brands
                </li>
                {brands.map((brand) => (
                  <li key={brand.brand_id}>
                    <Link 
                      to={`/all-products?brand=${brand.brand_id}`}
                      className="flex items-center px-4 py-2 hover:bg-gray-100 text-sm text-gray-800"
                      onClick={onItemClick}
                    >
                      {brand.logo_url ? (
                        <img 
                          src={brand.logo_url} 
                          alt={brand.name}
                          className="w-8 h-8 object-cover rounded mr-2"
                        />
                      ) : (
                        <Tag className="w-4 h-4 mr-2 text-gray-500" />
                      )}
                      <span>{brand.name}</span>
                    </Link>
                  </li>
                ))}
              </>
            )}
            
            {products.length > 0 && (
              <>
                <li className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                  Products
                </li>
                {products.map((product) => (
                  <li key={product.id}>
                    <Link 
                      to={`/product/${product.id}`}
                      className="flex items-center px-4 py-2 hover:bg-gray-100 text-sm text-gray-800"
                      onClick={onItemClick}
                    >
                      {product.primary_image && (
                        <img 
                          src={product.primary_image} 
                          alt={product.name}
                          className="w-8 h-8 object-cover rounded mr-2"
                        />
                      )}
                      <span>{product.name}</span>
                      {product.category && (
                        <span className="ml-2 text-xs text-gray-500">in {product.category}</span>
                      )}
                    </Link>
                  </li>
                ))}
              </>
            )}
          </ul>
          <div className="border-t border-gray-200 py-2 px-4">
            <Link 
              to={`/search?q=${searchQuery}&type=${searchType}`}
              className="text-[#F2631F] hover:text-orange-700 text-sm flex items-center"
              onClick={onItemClick}
            >
              See all results for "{searchQuery}"
            </Link>
          </div>
        </div>
      ) : (
        <div className="p-4 text-center text-gray-500">No results found for "{searchQuery}"</div>
      )}
    </div>
  );
};

export default SearchResults; 