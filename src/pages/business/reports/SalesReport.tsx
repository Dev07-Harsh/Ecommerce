import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar } from 'lucide-react';

const SalesReport = () => {
  const [dateRange, setDateRange] = useState({
    start: '2025-05-03',
    end: '2025-06-02'
  });

  // Mock data
  const salesData = Array.from({ length: 31 }, (_, i) => ({
    date: new Date(2025, 4, i + 1).toLocaleDateString(),
    sales: Math.floor(Math.random() * 1000),
    orders: Math.floor(Math.random() * 50)
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Header with date range */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-black">Sales Report</h1>
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
          { label: 'Total Sales', value: '$12,345', change: '+12%' },
          { label: 'Total Orders', value: '234', change: '+8%' },
          { label: 'Average Order Value', value: '$52.75', change: '+4%' },
          { label: 'Refund Rate', value: '2.3%', change: '-0.5%' }
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

      {/* Sales Over Time Chart */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-medium text-black mb-4">Sales Over Time</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="#FF4D00" 
                fill="#FF4D00"
                name="Sales ($)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Purchase Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-medium text-black mb-4">Purchase Funnel</h2>
          <div className="space-y-4">
            {[
              { label: 'Total Visits', value: '1,234' },
              { label: 'Product Views', value: '856' },
              { label: 'Added to Cart', value: '432' },
              { label: 'Purchased', value: '234' }
            ].map((step, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-gray-600">{step.label}</span>
                <span className="font-medium text-black">{step.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-medium text-black mb-4">Payment Methods</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { method: 'Credit Card', value: 65 },
                { method: 'PayPal', value: 20 },
                { method: 'Bank Transfer', value: 10 },
                { method: 'Other', value: 5 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="method" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#FF4D00" name="Usage %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesReport; 