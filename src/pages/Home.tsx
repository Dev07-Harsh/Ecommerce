import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import Hero from '../components/home/Hero';
import FeaturedProducts from '../components/home/FeaturedProducts';
import Categories from '../components/home/Categories';
import PromoProducts from '../components/home/PromoProducts';
import TrendingDeals from '../components/home/TrendingDeals';
import Brands from '../components/home/brands';
import Shop from '../components/home/Shop';
import Services from '../components/home/Services';
import HomepageProducts from '../components/home/HomepageProducts';
import SearchResults from '../components/common/SearchResults';
import useClickOutside from '../hooks/useClickOutside';

const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'products' | 'categories'>('all');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useClickOutside(searchRef, () => {
    setShowSearchResults(false);
  });

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length >= 2) {
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const searchParams = new URLSearchParams({
        q: searchQuery.trim(),
        type: searchType
      });
      navigate(`/search?${searchParams.toString()}`);
      setShowSearchResults(false);
      setSearchQuery('');
    }
  };

  return (
    <div className="pb-10">
      {/* Mobile Search Bar (Copied from Navbar) */}
      <div className="container mx-auto px-4 nav:hidden mt-2 mb-2 py-2">
        <div ref={searchRef} className="relative">
          <form onSubmit={handleSearchSubmit} className="relative">
            {/* Layout for screens >= sm and < nav */}
            <div className="hidden sm:flex items-center gap-2">
              {/* Search Input and Category Select Group */}
              <div className="flex flex-1 rounded-md overflow-hidden bg-white border border-gray-300 shadow-sm">
                <input
                  type="text"
                  placeholder="What are you looking for?"
                  className="w-full border-0 py-1.5 px-4 text-gray-900 focus:ring-0 focus:outline-none"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                />
                {/* Category Select */}
                <div className="relative flex items-center bg-gray-100">
                  <select 
                    className="h-full appearance-none bg-transparent py-1.5 pl-3 pr-8 text-gray-900 focus:ring-0 focus:outline-none text-sm"
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value as 'all' | 'products' | 'categories')}
                  >
                    <option value="all">All</option>
                    <option value="products">Products</option>
                    <option value="categories">Categories</option>
                  </select>
                </div>
              </div>
              {/* Search Button */}
              <button 
                type="submit"
                className="bg-[#F2631F] text-white py-1.5 px-6 rounded-md text-base hover:bg-orange-600 transition-colors"
              >
                Search
              </button>
            </div>

            {/* Layout for screens < sm */}
            <div className="sm:hidden space-y-2">
              {/* Search Input */}
              <div>
                <input
                  type="text"
                  placeholder="What are you looking for?"
                  className="w-full rounded-md border border-gray-300 shadow-sm py-1.5 px-4 text-gray-900 focus:ring-0 focus:outline-none text-base"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                />
              </div>
              {/* Category Dropdown Button and Search Button */}              
              <div className="flex items-center gap-2">
                 {/* Category Select - styled as a button */}
                 <select
                    className="flex-1 appearance-none bg-gray-100 border border-gray-300 rounded-md shadow-sm py-2 px-4 text-base text-gray-900 focus:ring-0 focus:outline-none pr-8"
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value as 'all' | 'products' | 'categories')}
                 >
                    <option value="all">All</option>
                    <option value="products">Products</option>
                    <option value="categories">Categories</option>
                 </select>
                 {/* Search Button */}
                 <button 
                   type="submit"
                   className="flex-1 bg-[#F2631F] text-white py-2 px-4 rounded-md text-base hover:bg-orange-600 transition-colors"
                 >
                   Search
                 </button>
              </div>
            </div>

            {/* SearchResults positioned below the flex container */}
            <SearchResults 
              isVisible={showSearchResults} 
              searchQuery={searchQuery}
              searchType={searchType}
              onItemClick={() => {
                setShowSearchResults(false);
                setSearchQuery('');
              }}
            />
          </form>
        </div>
      </div>

      {/* Content sections below mobile search bar */}
      <div className="nav:pt-8">
        <div className="space-y-8">
          <Hero />
          <Categories />
          <Brands />
          <Shop />
          <FeaturedProducts />
          <PromoProducts />
          <TrendingDeals />
          <HomepageProducts />
          <Services />
        </div>
      </div>
    </div>
  );
};

export default Home;