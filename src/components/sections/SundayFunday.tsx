import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import LiveCard from '../../data/LiveCard';

interface SundayFundayProps {
  layout?: 'row' | 'grid';
}

const SundayFunday: React.FC<SundayFundayProps> = ({ layout = 'row' }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 220 + 24; // card width (220px) + gap (24px)
    const scrollLeft = direction === 'left' 
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: scrollLeft,
      behavior: 'smooth'
    });
  };

  const sundayContent = [
    {
      id: 'sunday-1',
      title: 'Makeup Masterclass',
      host: 'Emma',
      thumbnail: 'https://images.unsplash.com/photo-1542596768-5d1d21f1cf98?w=500&h=500&fit=crop',
      viewers: 423,
      type: 'Sunday',
      productId: 'sunday-product-1'
    },
    {
      id: 'sunday-2',
      title: 'Makeup Masterclass',
      host: 'Sophie',
      thumbnail: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=500&h=500&fit=crop',
      viewers: 423,
      type: 'Sunday',
      productId: 'sunday-product-2'
    },
    {
      id: 'sunday-3',
      title: 'Makeup Masterclass',
      host: 'Sophie',
      thumbnail: 'https://images.unsplash.com/photo-1490367532201-b9bc1dc483f6?w=500&h=500&fit=crop',
      viewers: 423,
      type: 'Sunday',
      productId: 'sunday-product-3'
    },
    {
      id: 'sunday-4',
      title: 'Makeup Masterclass',
      host: 'Sophie',
      thumbnail: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=500&h=500&fit=crop',
      viewers: 423,
      type: 'Sunday',
      productId: 'sunday-product-4'
    },
    {
      id: 'sunday-5',
      title: 'Makeup Masterclass',
      host: 'Sophie',
      thumbnail: 'https://images.unsplash.com/photo-1523359346063-d879354c0ea5?w=500&h=500&fit=crop',
      viewers: 423,
      type: 'Sunday',
      productId: 'sunday-product-5'
    }
  ];

  // Row layout (for LiveShop page)
  if (layout === 'row') {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[28px] font-medium text-gray-900">Sunday Funday</h2>
        <a href="/live-shop/sunday-funday" className="text-sm text-gray-600 hover:text-gray-900">
          See All
        </a>
      </div>
      
      <div className="relative px-12">
        <button 
          className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#FF4D00] hover:bg-[#FF4D00]/90 rounded-full flex items-center justify-center shadow-md z-10 transition-colors duration-200"
          aria-label="Previous"
          onClick={() => handleScroll('left')}
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>

        <div 
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-4 no-scrollbar scroll-smooth"
        >
          {sundayContent.map((item) => (
            <LiveCard key={item.id} {...item} />
          ))}
        </div>

        <button 
          className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#FF4D00] hover:bg-[#FF4D00]/90 rounded-full flex items-center justify-center shadow-md z-10 transition-colors duration-200"
          aria-label="Next"
          onClick={() => handleScroll('right')}
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
        </div>
      </div>
    );
  }

  // Grid layout (for standalone page)
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-[1440px] mx-auto px-16 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-[36px] font-medium text-[#FF4D00]">Sunday Funday</h1>
        </div>
        
        <div className="grid grid-cols-5 gap-6 mb-8">
          {sundayContent.map((item) => (
            <LiveCard key={item.id} {...item} />
          ))}
        </div>

        <div className="flex justify-center">
          <button className="bg-[#FF4D00] hover:bg-[#FF4D00]/90 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200">
            See More
          </button>
        </div>
      </div>
    </div>
  );
};

export default SundayFunday; 