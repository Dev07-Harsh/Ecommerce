import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import LiveCard from '../../data/LiveCard';

interface AoinLiveProps {
  layout?: 'row' | 'grid';
}

const AoinLive: React.FC<AoinLiveProps> = ({ layout = 'row' }) => {
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

  const liveContent = [
    {
      id: '1',
      title: 'Live with Sarah',
      host: 'Sarah',
      thumbnail: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&h=500&fit=crop',
      viewers: 423,
      isLive: true,
      type: 'Live',
      productId: 'fashion-1'
    },
    {
      id: '2',
      title: 'Tech Talk with Mark',
      host: 'Mark',
      thumbnail: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&h=500&fit=crop',
      viewers: 423,
      isLive: true,
      type: 'Live',
      productId: 'fashion-2'
    },
    {
      id: '3',
      title: 'Beauty Secrets with Chloe',
      host: 'Chloe',
      thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&h=500&fit=crop',
      viewers: 423,
      isLive: true,
      type: 'Live',
      productId: 'fashion-3'
    },
    {
      id: '4',
      title: 'Beauty Secrets with Chloe',
      host: 'Chloe',
      thumbnail: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=500&h=500&fit=crop',
      viewers: 423,
      isLive: true,
      type: 'Live',
      productId: 'fashion-4'
    },
    {
      id: '5',
      title: 'Beauty Secrets with Chloe',
      host: 'Chloe',
      thumbnail: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&h=500&fit=crop',
      viewers: 423,
      isLive: true,
      type: 'Live',
      productId: 'fashion-5'
    }
  ];

  // Row layout (for LiveShop page)
  if (layout === 'row') {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[28px] font-medium text-[#FF4D00]">AOIN LIVE</h2>
        <a href="/live-shop/aoin-live" className="text-sm text-gray-600 hover:text-gray-900">
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
          {liveContent.map((item) => (
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
          <h1 className="text-[36px] font-medium text-[#FF4D00]">AOIN LIVE</h1>
        </div>
        
        <div className="grid grid-cols-5 gap-6 mb-8">
          {liveContent.map((item) => (
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

export default AoinLive; 