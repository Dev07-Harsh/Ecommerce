import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface ICarouselItem {
  id: number;
  type: 'brand' | 'product' | 'promo' | 'new' | 'featured';
  image_url: string;
  shareable_link: string;
  display_order: number;
  is_active: boolean;
}

const TopSellingCarousel: React.FC = () => {
  const [carouselItems, setCarouselItems] = useState<ICarouselItem[]>([]);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [sliding, setSliding] = useState(false);

  useEffect(() => {
    fetchCarouselItems();
  }, []);

  useEffect(() => {
    if (carouselItems.length === 0) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % carouselItems.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [carouselItems]);

  const fetchCarouselItems = async () => {
    try {
      // Fetch all product group types
      const response = await fetch(`${API_BASE_URL}/api/homepage/carousels?type=promo,new,featured`);
      if (!response.ok) throw new Error('Failed to fetch carousel items');
      const data = await response.json();
      // Filter active items and sort by display_order
      const activeItems = data
        .filter((item: ICarouselItem) => item.is_active)
        .sort((a: ICarouselItem, b: ICarouselItem) => a.display_order - b.display_order);
      setCarouselItems(activeItems);
    } catch (error) {
      console.error('Error fetching carousel items:', error);
    }
  };

  const slide = (direction: 'prev' | 'next', targetIndex: number) => {
    if (sliding) return;
    setDirection(direction);
    setSliding(true);
    setTimeout(() => {
      setCurrent(targetIndex);
      setSliding(false);
    }, 400);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const targetIndex = (current - 1 + carouselItems.length) % carouselItems.length;
    slide('prev', targetIndex);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const targetIndex = (current + 1) % carouselItems.length;
    slide('next', targetIndex);
  };

  const getItemStyle = (index: number) => {
    if (index === current) {
      return 'translate-y-0 opacity-100 z-20';
    } else if (
      sliding &&
      ((direction === 'next' && index === (current + 1) % carouselItems.length) ||
        (direction === 'prev' && index === (current - 1 + carouselItems.length) % carouselItems.length))
    ) {
      return `${direction === 'next' ? 'translate-y-full' : '-translate-y-full'} opacity-100 z-10`;
    }
    return 'translate-y-full opacity-0 -z-10';
  };

  if (carouselItems.length === 0) {
    return (
      <div className="h-full flex flex-col justify-between rounded-lg shadow-sm overflow-hidden border border-gray-100">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF5733]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col justify-between rounded-lg shadow-sm overflow-hidden border border-gray-100 relative">
      {/* Main carousel content */}
      <div className="flex-grow overflow-hidden relative">
        {carouselItems.map((item, idx) => (
          <div
            key={item.id}
            className={`absolute inset-0 w-full h-full transition-transform duration-400 ease-in-out ${getItemStyle(idx)}`}
          >
            {/* Full background image */}
            <img
              src={item.image_url}
              alt={item.type === 'promo' ? 'Promo Products' : 
                   item.type === 'new' ? 'New Products' : 
                   'Featured Products'}
              className="absolute inset-0 w-full h-full object-cover z-0"
              style={{ borderRadius: 'inherit' }}
            />
            {/* Overlay content */}
            <div className="flex flex-col h-full justify-end items-center relative z-10 pb-8">
              <a
                href={item.shareable_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2 rounded-md transition-colors shadow-lg mb-4"
              >
                {item.type === 'promo' ? 'View Promo Products' :
                 item.type === 'new' ? 'View New Products' :
                 'View Featured Products'}
              </a>
              {/* Navigation dots */}
              <div className="flex justify-center items-center mb-2">
                {carouselItems.map((_, dotIdx) => (
                  <div
                    key={dotIdx}
                    className={`w-2 h-2 mx-0.5 rounded-full transition-all duration-300 ${
                      current === dotIdx ? 'bg-white' : 'bg-white/40 hover:bg-white/60'
                    }`}
                    onClick={() => !sliding && setCurrent(dotIdx)}
                    role="button"
                    aria-label={`Go to slide ${dotIdx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Navigation arrows */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 z-20">
        <button
          onClick={(e) => handlePrev(e)}
          className="bg-white/10 hover:bg-white/20 p-1 flex items-center justify-center transition-colors text-white"
          disabled={sliding}
        >
          <ChevronUp size={16} />
        </button>
      </div>
      <div className="absolute top-1/2 right-0 -translate-y-1/2 z-20">
        <button
          onClick={(e) => handleNext(e)}
          className="bg-white/10 hover:bg-white/20 p-1 flex items-center justify-center transition-colors text-white"
          disabled={sliding}
        >
          <ChevronDown size={16} />
        </button>
      </div>
    </div>
  );
};

export default TopSellingCarousel; 