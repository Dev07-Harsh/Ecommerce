import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import LiveCard from '../../data/LiveCard';

interface ComingSoonProps {
  layout?: 'row' | 'grid';
}

const ComingSoon: React.FC<ComingSoonProps> = ({ layout = 'row' }) => {
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

  const upcomingContent = [
    {
      id: '1',
      title: 'Fashion Week Preview',
      host: 'Emma',
      thumbnail: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=500&h=500&fit=crop',
      type: 'Fashion'
    },
    {
      id: '2',
      title: 'Tech Launch Event',
      host: 'Alex',
      thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500&h=500&fit=crop',
      type: 'Tech'
    },
    {
      id: '3',
      title: 'Makeup Masterclass',
      host: 'Sophie',
      thumbnail: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&h=500&fit=crop',
      type: 'Beauty'
    },
    {
      id: '4',
      title: 'Makeup Masterclass',
      host: 'Sophie',
      thumbnail: 'https://images.unsplash.com/photo-1583241749708-a482a09f59ff?w=500&h=500&fit=crop',
      type: 'Beauty'
    },
    {
      id: '5',
      title: 'Makeup Masterclass',
      host: 'Sophie',
      thumbnail: 'https://images.unsplash.com/photo-1599848880232-057d8e17d91d?w=500&h=500&fit=crop',
      type: 'Beauty'
    }
  ];

  // Row layout (for LiveShop page)
  if (layout === 'row') {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[28px] font-medium text-gray-900">Coming Soon</h2>
        <a href="/live-shop/coming-soon" className="text-sm text-gray-600 hover:text-gray-900">
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
          {upcomingContent.map((item) => (
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
          <h1 className="text-[36px] font-medium text-[#FF4D00]">Coming Soon</h1>
        </div>
        
        <div className="grid grid-cols-5 gap-6 mb-8">
          {upcomingContent.map((item) => (
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

export default ComingSoon; 