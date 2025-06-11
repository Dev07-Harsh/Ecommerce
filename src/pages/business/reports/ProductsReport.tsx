import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar } from 'lucide-react';

const ProductsReport = () => {
  const [dateRange, setDateRange] = useState({
    start: '2025-05-03',
    end: '2025-06-02'
  });

  // Mock data for products sold over time
  const productData = Array.from({ length: 31 }, (_, i) => ({
    date: new Date(2025, 4, i + 1).toLocaleDateString(),
    quantity: Math.floor(Math.random() * 50),
    wishlisted: Math.floor(Math.random() * 20)
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Header with date range */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-black">Products Report</h1>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-[#FF4D00] transition-colors">
            <Calendar className="w-4 h-4" />
            <span>{dateRange.start}</span>
            <span>to</span>
            <span>{dateRange.end}</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: '234', change: '+5%' },
          { label: 'Products Sold', value: '1,234', change: '+12%' },
          { label: 'Wishlisted Products', value: '456', change: '+8%' },
          { label: 'Out of Stock', value: '12', change: '-2%' }
        ].map((stat, index) => (
          <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-2xl font-semibold text-black mt-1">{stat.value}</p>
            <p className={`text-sm mt-2 ${
              stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
            }`}>
              {stat.change} vs last period
            </p>
          </div>
        ))}
      </div>

      {/* Products Sold Over Time Chart */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-medium text-black mb-4">Products Sold Over Time</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={productData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="quantity" 
                stroke="#FF4D00" 
                fill="#FF4D00"
                name="Quantity Sold"
              />
              <Line 
                type="monotone" 
                dataKey="wishlisted" 
                stroke="#FFE5D9" 
                fill="#FFE5D9"
                name="Wishlisted"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-medium text-black mb-4">Top Selling Products</h2>
          <div className="space-y-4">
            {[
              { name: 'Classic White T-Shirt', sold: 156, revenue: '$3,900' },
              { name: 'Denim Jeans', sold: 98, revenue: '$4,900' },
              { name: 'Running Shoes', sold: 87, revenue: '$8,700' },
              { name: 'Leather Wallet', sold: 76, revenue: '$3,800' }
            ].map((product, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-gray-600">{product.name}</span>
                <div className="text-right">
                  <span className="font-medium text-black">{product.sold} sold</span>
                  <span className="text-gray-500 ml-2">({product.revenue})</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-medium text-black mb-4">Most Viewed Products</h2>
          <div className="space-y-4">
            {[
              { name: 'Summer Collection Dress', views: 1256, conversion: '4.5%' },
              { name: 'Sports Watch', views: 986, conversion: '3.8%' },
              { name: 'Wireless Earbuds', views: 867, conversion: '5.2%' },
              { name: 'Laptop Backpack', views: 756, conversion: '4.1%' }
            ].map((product, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-gray-600">{product.name}</span>
                <div className="text-right">
                  <span className="font-medium text-black">{product.views} views</span>
                  <span className="text-gray-500 ml-2">({product.conversion})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsReport; 