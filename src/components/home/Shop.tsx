import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ShopBanner {
  id: number;
  title: string;
  subtitle: string;
  discount: string;
  description: string;
  image: string;
  brands: string[];
  cta: string;
  openingTime: string;
  closingTime: string;
  shopId: string;
}

const Shop = () => {
  const navigate = useNavigate();

  // Shop data
  const shopBanners: ShopBanner[] = [
    {
      id: 1,
      title: "MIN. 50% OFF",
      subtitle: "Extra 20% off on",
      discount: "Indianwear for 9 to 5",
      description: "Ethnic elegance meets workplace chic",
      image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80",
      brands: ["Libas", "W", "Biba", "Global Desi"],
      cta: "SHOP NOW",
      openingTime: "10:00 AM",
      closingTime: "10:00 PM",
      shopId: "fashion"
    },
    {
      id: 2,
      title: "UP TO 80% OFF",
      subtitle: "Stylish dials that will",
      discount: "get you compliments",
      description: "Premium timepieces for every occasion",
      image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80",
      brands: ["TITAN", "FOSSIL", "TIMEX", "CASIO"],
      cta: "SHOP NOW",
      openingTime: "9:00 AM",
      closingTime: "9:00 PM",
      shopId: "watches"
    },
    {
      id: 3,
      title: "FLAT 60% OFF",
      subtitle: "Smart tech that",
      discount: "transforms your lifestyle",
      description: "Latest gadgets and electronics",
      image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80",
      brands: ["SAMSUNG", "APPLE", "XIAOMI", "SONY"],
      cta: "SHOP NOW",
      openingTime: "8:00 AM",
      closingTime: "11:00 PM",
      shopId: "electronics"
    },
    {
      id: 4,
      title: "UPTO 70% OFF",
      subtitle: "Footwear that speaks",
      discount: "your style language",
      description: "Step up your shoe game",
      image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80",
      brands: ["NIKE", "ADIDAS", "PUMA", "REEBOK"],
      cta: "SHOP NOW",
      openingTime: "10:00 AM",
      closingTime: "9:30 PM",
      shopId: "footwear"
    }
  ];

  const handleShopClick = (shopId: string) => {
    navigate(`/shop/${shopId}`);
  };

  return (
    <section className="py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="space-y-6">
          {shopBanners.map((shop) => (
            <div 
              key={shop.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer transform transition-all duration-300 hover:shadow-md"
              onClick={() => handleShopClick(shop.shopId)}
            >
              <div className="flex flex-col md:flex-row">
                {/* Left Side - Image */}
                <div className="w-full md:w-1/2 relative h-64 md:h-auto">
                  <img
                    src={shop.image}
                    alt={shop.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Opening Hours Badge */}
                  <div className="absolute top-4 left-4 bg-black/30 backdrop-blur-sm rounded-full px-4 py-1.5">
                    <p className="text-sm font-medium text-white flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      {shop.openingTime} - {shop.closingTime}
                    </p>
                  </div>
                </div>

                {/* Right Side - Content */}
                <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between">
                  <div>
                    {/* Header */}
                    <div className="mb-4">
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        {shop.title}
                      </h2>
                      <p className="text-lg text-gray-600">
                        {shop.subtitle} <br />
                        {shop.discount}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 mb-6">
                      {shop.description}
                    </p>

                    {/* Brands */}
                    <div className="flex flex-wrap gap-3 mb-6">
                      {shop.brands.map((brand, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                        >
                          {brand}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button 
                    className="w-full bg-[#FF4D00] text-white py-3 rounded-lg font-semibold hover:bg-[#FF4D00]/90 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShopClick(shop.shopId);
                    }}
                  >
                    {shop.cta}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Shop; 