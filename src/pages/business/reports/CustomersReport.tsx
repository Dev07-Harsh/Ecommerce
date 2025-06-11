import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar } from 'lucide-react';

const CustomersReport = () => {
  const [dateRange, setDateRange] = useState({
    start: '2025-05-03',
    end: '2025-06-02'
  });

  // Mock data for customer traffic by day
  const trafficData = [
    { day: 'Sunday', current: 31, previous: 22 },
    { day: 'Monday', current: 20, previous: 19 },
    { day: 'Tuesday', current: 16, previous: 35 },
    { day: 'Wednesday', current: 24, previous: 12 },
    { day: 'Thursday', current: 55, previous: 11 },
    { day: 'Friday', current: 68, previous: 22 },
    { day: 'Saturday', current: 72, previous: 41 }
  ];

  // Mock data for customer growth
  const customerGrowthData = Array.from({ length: 31 }, (_, i) => ({
    date: new Date(2025, 4, i + 1).toLocaleDateString(),
    customers: Math.floor(Math.random() * 100)
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Header with date range */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-black">Customers Report</h1>
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
          { label: 'Total Customers', value: '1,234', change: '+12%' },
          { label: 'New Customers', value: '123', change: '+8%' },
          { label: 'Returning Customers', value: '456', change: '+15%' },
          { label: 'Customer Retention', value: '85%', change: '+2%' }
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

      {/* Customer Growth Chart */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-medium text-black mb-4">Customer Growth</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={customerGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="customers" 
                stroke="#FF4D00" 
                fill="#FF4D00"
                name="Total Customers"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Customer Traffic by Day */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-medium text-black mb-4">Customer Traffic by Day</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trafficData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="current" name="Current Period" fill="#FF4D00" />
              <Bar dataKey="previous" name="Previous Period" fill="#FFE5D9" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Customer Segments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-medium text-black mb-4">Top Customer Groups</h2>
          <div className="space-y-4">
            {[
              { group: 'Regular Customers', count: '456', percentage: '45%' },
              { group: 'VIP Members', count: '234', percentage: '23%' },
              { group: 'New Customers', count: '123', percentage: '12%' },
              { group: 'One-time Buyers', count: '201', percentage: '20%' }
            ].map((segment, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-gray-600">{segment.group}</span>
                <div className="text-right">
                  <span className="font-medium text-black">{segment.count}</span>
                  <span className="text-gray-500 ml-2">({segment.percentage})</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-medium text-black mb-4">Customers with Most Reviews</h2>
          <div className="space-y-4">
            {[
              { name: 'John Doe', reviews: 12, rating: 4.5 },
              { name: 'Jane Smith', reviews: 8, rating: 4.8 },
              { name: 'Mike Johnson', reviews: 6, rating: 4.2 },
              { name: 'Sarah Wilson', reviews: 5, rating: 4.6 }
            ].map((customer, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-gray-600">{customer.name}</span>
                <div className="text-right">
                  <span className="font-medium text-black">{customer.reviews} reviews</span>
                  <span className="text-gray-500 ml-2">({customer.rating}★)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomersReport; 