import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import LiveCard from '../../data/LiveCard';

interface FashionContent {
  id: string;
  title: string;
  host: string;
  thumbnail: string;
  viewers?: number;
  type?: string;
}

interface FashionProps {
  layout?: 'row' | 'grid';
}

const Fashion: React.FC<FashionProps> = ({ layout = 'row' }) => {
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

  const fashionContent: FashionContent[] = [
    {
      id: '1',
      title: 'Live with Sarah',
      host: 'Sarah',
      thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&h=500&fit=crop',
      viewers: 423,
      type: 'Fashion'
    },
    {
      id: '2',
      title: 'Tech Talk with Mark',
      host: 'Mark',
      thumbnail: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=500&h=500&fit=crop',
      viewers: 423,
      type: 'Fashion'
    },
    {
      id: '3',
      title: 'Beauty Secrets with Chloe',
      host: 'Chloe',
      thumbnail: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=500&h=500&fit=crop',
      viewers: 423,
      type: 'Fashion'
    },
    {
      id: '4',
      title: 'Beauty Secrets with Chloe',
      host: 'Chloe',
      thumbnail: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=500&h=500&fit=crop',
      viewers: 423,
      type: 'Fashion'
    },
    {
      id: '5',
      title: 'Beauty Secrets with Chloe',
      host: 'Chloe',
      thumbnail: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=500&h=500&fit=crop',
      viewers: 423,
      type: 'Fashion'
    },
    {
      id: '6',
      title: 'Live with Sarah',
      host: 'Sarah',
      thumbnail: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=500&h=500&fit=crop',
      viewers: 423,
      type: 'Fashion'
    },
    {
      id: '7',
      title: 'Tech Talk with Mark',
      host: 'Mark',
      thumbnail: 'https://images.unsplash.com/photo-1483181957632-8bda974cbc91?w=500&h=500&fit=crop',
      viewers: 423,
      type: 'Fashion'
    },
    {
      id: '8',
      title: 'Beauty Secrets with Chloe',
      host: 'Chloe',
      thumbnail: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&h=500&fit=crop',
      viewers: 423,
      type: 'Fashion'
    },
    {
      id: '9',
      title: 'Beauty Secrets with Chloe',
      host: 'Chloe',
      thumbnail: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&h=500&fit=crop',
      viewers: 423,
      type: 'Fashion'
    },
    {
      id: '10',
      title: 'Beauty Secrets with Chloe',
      host: 'Chloe',
      thumbnail: 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=500&h=500&fit=crop',
      viewers: 423,
      type: 'Fashion'
    },
    {
      id: '11',
      title: 'Live with Sarah',
      host: 'Sarah',
      thumbnail: 'https://images.unsplash.com/photo-1536243298547-ea894ed2eb08?w=500&h=500&fit=crop',
      viewers: 423,
      type: 'Fashion'
    },
    {
      id: '12',
      title: 'Tech Talk with Mark',
      host: 'Mark',
      thumbnail: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=500&h=500&fit=crop',
      viewers: 423,
      type: 'Fashion'
    },
    {
      id: '13',
      title: 'Beauty Secrets with Chloe',
      host: 'Chloe',
      thumbnail: 'https://images.unsplash.com/photo-1485125639709-a60c3a500bf1?w=500&h=500&fit=crop',
      viewers: 423,
      type: 'Fashion'
    },
    {
      id: '14',
      title: 'Beauty Secrets with Chloe',
      host: 'Chloe',
      thumbnail: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&h=500&fit=crop',
      viewers: 423,
      type: 'Fashion'
    },
    {
      id: '15',
      title: 'Beauty Secrets with Chloe',
      host: 'Chloe',
      thumbnail: 'https://images.unsplash.com/photo-1517365830460-955ce3ccd263?w=500&h=500&fit=crop',
      viewers: 423,
      type: 'Fashion'
    },
    {
      id: '16',
      title: 'Live with Sarah',
      host: 'Sarah',
      thumbnail: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=500&h=500&fit=crop',
      viewers: 423,
      type: 'Fashion'
    },
    {
      id: '17',
      title: 'Tech Talk with Mark',
      host: 'Mark',
      thumbnail: 'https://images.unsplash.com/photo-1492288991661-058aa541ff43?w=500&h=500&fit=crop',
      viewers: 423,
      type: 'Fashion'
    },
    {
      id: '18',
      title: 'Beauty Secrets with Chloe',
      host: 'Chloe',
      thumbnail: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&h=500&fit=crop',
      viewers: 423,
      type: 'Fashion'
    },
    {
      id: '19',
      title: 'Beauty Secrets with Chloe',
      host: 'Chloe',
      thumbnail: 'https://images.unsplash.com/photo-1475180098004-ca77a66827be?w=500&h=500&fit=crop',
      viewers: 423,
      type: 'Fashion'
    },
    {
      id: '20',
      title: 'Beauty Secrets with Chloe',
      host: 'Chloe',
      thumbnail: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=500&h=500&fit=crop',
      viewers: 423,
      type: 'Fashion'
    }
  ];

  // Row layout (for LiveShop page)
  if (layout === 'row') {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[28px] font-medium text-gray-900">Fashion</h2>
          <a href="/live-shop/fashion" className="text-sm text-gray-600 hover:text-gray-900">
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
            {fashionContent.map((item) => (
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

  // Grid layout (for Fashion page)
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-[1440px] mx-auto px-16 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-[36px] font-medium text-[#FF4D00]">Fashion</h1>
        </div>
        
        <div className="grid grid-cols-5 gap-6 mb-8">
          {fashionContent.map((item) => (
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

export default Fashion;