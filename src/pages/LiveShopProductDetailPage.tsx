import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LiveCard from '../data/LiveCard';

interface LiveShopProductDetailPageProps {
  title?: string;
  price?: number;
  description?: string;
  material?: string;
  imageUrl?: string;
}

const LiveShopProductDetailPage: React.FC<LiveShopProductDetailPageProps> = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [selectedSize, setSelectedSize] = useState('S');
  const [selectedColor, setSelectedColor] = useState('#DC3545');
  
  const sizes = ['XS', 'S', 'M', 'L', 'XL'];
  const colors = ['#DC3545', '#4CAF50', '#FFC107', '#FF93A8'];

  // Mock data for sections
  const fashionFactoryContent = [
    {
      id: '1',
      title: 'Live with Sarah',
      host: 'Sarah',
      thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&h=500&fit=crop',
      viewers: 423
    },
    {
      id: '2',
      title: 'Tech Talk with Mark',
      host: 'Mark',
      thumbnail: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=500&h=500&fit=crop',
      viewers: 423
    },
    {
      id: '3',
      title: 'Beauty Secrets with Chloe',
      host: 'Chloe',
      thumbnail: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=500&h=500&fit=crop',
      viewers: 423
    },
    {
      id: '4',
      title: 'Beauty Secrets with Chloe',
      host: 'Chloe',
      thumbnail: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=500&h=500&fit=crop',
      viewers: 423
    },
    {
      id: '5',
      title: 'Beauty Secrets with Chloe',
      host: 'Chloe',
      thumbnail: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=500&h=500&fit=crop',
      viewers: 423
    },
    {
      id: '6',
      title: 'Beauty Secrets with Chloe',
      host: 'Chloe',
      thumbnail: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=500&h=500&fit=crop',
      viewers: 423
    }
  ];

  // Product data
  const productData = {
    title: "Fashion clothing",
    price: 79.99,
    description: "This elegant midi dress features a vibrant floral print, perfect for any occasion. Made from lightweight, breathable fabric, it offers both style and comfort.",
    material: "100% Pure cotton",
    imageUrl: "/fashion-live-stream.jpg",
    productImage: "/floral-dress.jpg",
    hostImage: "/host-avatar.jpg",
    hostName: "Sarah Johnson"
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1440px] mx-auto">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3">
          <h1 className="text-[#FF4D00] text-lg font-medium">Fashion Live</h1>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row">
          {/* Left Section - Live Stream/Image */}
          <div className="w-full lg:w-1/2 h-[400px] lg:h-[600px] relative bg-[#FF4D00]">
            {/* Black overlay for video */}
            <div className="absolute inset-0 bg-black/20"></div>
            
            {/* Video or Image */}
            <img 
              src="/fashion-model.jpg"
              alt="Fashion Live Stream"
              className="w-full h-full object-cover"
            />
            
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform cursor-pointer">
                <svg className="w-10 h-10 text-gray-900" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>

            {/* Live Indicator */}
            <div className="absolute top-4 left-4 flex items-center space-x-2 bg-black/30 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-sm font-medium text-white">423</span>
            </div>

            {/* Close Button */}
            <button 
              onClick={() => navigate(-1)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/30 flex items-center justify-center text-white hover:bg-black/40 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* AOIN Live Card */}
            <div className="absolute left-4 bottom-4 w-[300px]">
              <div className="bg-[#FFE4E1] rounded-xl p-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-[#FF4D00] rounded-lg flex items-center justify-center">
                    <span className="text-white font-medium">AOIN</span>
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center">
                      <span className="bg-white text-[#FF4D00] text-xs font-medium px-2 py-0.5 rounded">LIVE</span>
                    </div>
                    <h3 className="text-[#FF4D00] text-sm font-medium mt-1">AOIN LIVE SHOP</h3>
                    <div className="flex items-center justify-between">
                      <p className="text-[#FF4D00]/80 text-xs">Fashion live shopping</p>
                      <span className="text-[#FF4D00] font-medium">$430.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Product Details */}
          <div className="w-full lg:w-1/2 p-4 sm:p-6 bg-white">
            <div className="max-w-lg mx-auto">
              <h2 className="text-lg font-medium mb-4">About Product</h2>

              {/* Host Info */}
              <div className="flex items-center bg-white rounded-lg border border-gray-100 p-3 mb-6">
                <div className="flex items-center flex-1">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <img 
                      src="/host-avatar.jpg"
                      alt="Host"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium">Fashion clothing</h3>
                    <p className="text-xs text-gray-500">100% Pure cotton</p>
                  </div>
                </div>
                <button className="text-[#FF4D00] hover:text-[#FF4D00]/80 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </button>
              </div>

              {/* Product Preview */}
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <div className="w-40 h-40 mx-auto mb-4">
                  <img 
                    src="/floral-dress.jpg"
                    alt="Floral Print Midi Dress"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <h3 className="text-base font-medium text-center mb-2">Floral Print Midi Dress</h3>
                <p className="text-sm text-gray-600 text-center leading-relaxed">
                  This elegant midi dress features a vibrant floral print, perfect for any occasion. Made from lightweight, breathable fabric, it offers both style and comfort.
                </p>
              </div>

              {/* Size Selection */}
              <div className="mb-8">
                <h3 className="text-sm font-medium mb-4">Size</h3>
                <div className="flex gap-4">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-14 h-14 rounded-lg flex items-center justify-center text-sm font-medium transition-colors
                        ${selectedSize === size 
                          ? 'bg-[#FF4D00] text-white' 
                          : 'border border-gray-200 text-gray-700 hover:border-[#FF4D00]'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div className="mb-8">
                <h3 className="text-sm font-medium mb-4">Color</h3>
                <div className="flex gap-4">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full transition-transform ${selectedColor === color ? 'ring-2 ring-[#FF4D00] ring-offset-2' : ''}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Price and Add to Cart */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">${productData.price}</span>
                  <button className="bg-[#FF4D00] text-white px-8 py-3 rounded-lg text-sm font-medium hover:bg-[#FF4D00]/90 transition-colors">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fashion Factory Section */}
        <div className="px-4 sm:px-6 py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-900">Fashion Factory</h2>
            <a href="/live-shop/fashion-factory" className="text-sm text-gray-600 hover:text-gray-900">
              See All
            </a>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {fashionFactoryContent.map((item) => (
              <LiveCard key={item.id} {...item} />
            ))}
          </div>
        </div>

        {/* Sunday Funday Section */}
        <div className="px-4 sm:px-6 pb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-900">Sunday Funday</h2>
            <a href="/live-shop/sunday-funday" className="text-sm text-gray-600 hover:text-gray-900">
              See All
            </a>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {fashionFactoryContent.map((item) => (
              <LiveCard key={item.id} {...item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveShopProductDetailPage; 