import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import TopSellingCarousel from './TopSellingCarousel';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface ICarouselItem {
  id: number;
  image_url: string;
  shareable_link: string;
  display_order: number;
}

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const [carouselItems, setCarouselItems] = useState<ICarouselItem[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  useEffect(() => {
    fetchCarouselItems();
  }, []);

  useEffect(() => {
    if (carouselItems.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [carouselItems]);

  const fetchCarouselItems = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/homepage/carousels?type=brand`);
      if (!response.ok) throw new Error('Failed to fetch carousel items');
      const data = await response.json();
      setCarouselItems(data);
    } catch (error) {
      console.error('Error fetching carousel items:', error);
    }
  };

  // Side panels for featured categories
  

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === carouselItems.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? carouselItems.length - 1 : prev - 1));
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const handleOrderNowClick = (url: string) => {
    // Check if the URL is external (starts with http:// or https://)
    if (url.startsWith('http://') || url.startsWith('https://')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      // If it's an internal URL, use React Router navigation
      navigate(url);
    }
  };

  if (carouselItems.length === 0) {
    return (
      <section className="w-full">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF5733]"></div>
          </div>
        </div>
      </section>
    );
  }

  const current = carouselItems[currentSlide];

  return (
    <section className="w-full">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          <div className="relative overflow-hidden">
            {/* Responsive flex: column on mobile, row on desktop */}
            <div className="flex flex-col md:flex-row gap-4 items-stretch">
              {/* Side carousel - always visible, responsive width */}
              <div className="w-full md:w-1/5 min-w-[220px] max-w-xs mx-auto md:mx-0">
                <TopSellingCarousel />
              </div>
              {/* Main carousel - always visible, responsive width */}
              <div className="flex-1">
                <div className="w-full">
                  <div className="flex flex-col">
                    {/* Main carousel - center */}
                    <div className="w-full">
                      <div className={`bg-gradient-to-r from-purple-500 to-orange-400 rounded-lg overflow-hidden relative h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px]`}>
                        <div className="absolute inset-0 flex flex-col justify-center items-center">
                          <div className="w-full h-full relative">
                            <img 
                              src={current.image_url}
                              alt="Carousel"
                              className="w-full h-full object-cover rounded-lg"
                              style={{ objectPosition: 'center' }}
                            />
                            <button 
                              onClick={() => handleOrderNowClick(current.shareable_link)}
                              className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white text-black px-4 sm:px-6 py-2 rounded font-medium hover:bg-gray-100 transition-colors text-sm sm:text-base shadow-lg"
                            >
                              Order Now
                            </button>
                          </div>
                        </div>
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2">
                          {carouselItems.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => goToSlide(index)}
                              className={`h-1.5 sm:h-2 w-6 sm:w-8 rounded-full transition-all ${
                                currentSlide === index ? 'bg-white' : 'bg-white/50'
                              }`}
                            ></button>
                          ))}
                        </div>
                        <div className="absolute top-1/2 transform -translate-y-1/2 w-full flex justify-between px-2 sm:px-4">
                          <button 
                            onClick={prevSlide}
                            className="p-1 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition"
                          >
                            <ChevronLeft size={16} className="sm:hidden" />
                            <ChevronLeft size={20} className="hidden sm:block" />
                          </button>
                          <button 
                            onClick={nextSlide}
                            className="p-1 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition"
                          >
                            <ChevronRight size={16} className="sm:hidden" />
                            <ChevronRight size={20} className="hidden sm:block" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;