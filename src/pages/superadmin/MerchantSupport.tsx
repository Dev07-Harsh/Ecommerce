import React, { useState } from 'react';
import { Eye, X } from 'lucide-react';

const merchantSupportData = [
  {
    name: 'Karan Verma',
    email: 'karan@store.com',
    mobile: '9012345678',
    store: 'TechKart',
    title: 'Payment Gateway Issue',
    description: 'Payments failing intermittently during checkout.',
    image: 'https://via.placeholder.com/300x150?text=Payment+Issue',
    priority: 'High',
  },
  {
    name: 'Sanya Reddy',
    email: 'sanya@shopzone.com',
    mobile: '9876543210',
    store: 'ShopZone',
    title: 'Late Delivery Complaints',
    description: 'Multiple complaints about delayed shipments.',
    image: 'https://via.placeholder.com/300x150?text=Delivery+Issue',
    priority: 'Medium',
  },
  {
    name: 'Rahul Sharma',
    email: 'rahul@wearindia.com',
    mobile: '9988776655',
    store: 'WearIndia',
    title: 'Product Listing Error',
    description: 'Unable to update product prices on dashboard.',
    image: 'https://via.placeholder.com/300x150?text=Listing+Error',
    priority: 'Low',
  },
  {
    name: 'Nisha Patel',
    email: 'nisha@dailycart.com',
    mobile: '9865321470',
    store: 'DailyCart',
    title: 'Store Dashboard Bug',
    description: 'Dashboard freezes when accessing order history.',
    image: 'https://via.placeholder.com/300x150?text=Dashboard+Bug',
    priority: 'High',
  },
];

const MerchantSupport: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [selectedItem, setSelectedItem] = useState<any>(null); // To hold modal data

  const filteredData = merchantSupportData.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.store.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPriority =
      priorityFilter === 'All' || item.priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold mb-4">Merchant Support</h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-2 mb-4 items-center">
        <input
          type="text"
          placeholder="Search name, email, store or title..."
          className="px-2 py-1 border border-gray-300 rounded-md w-full md:w-1/3 text-xs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-2 py-1 border border-gray-300 rounded-md text-xs"
        >
          <option value="All">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white text-xs rounded-md overflow-hidden shadow border border-gray-200">
          <thead className="bg-orange-50 text-orange-400 font-semibold">
            <tr>
              <th className="px-7 py-3 text-left">Name</th>
              <th className="px-7 py-3 text-left">Email</th>
              <th className="px-7 py-3 text-left">Mobile</th>
              <th className="px-7 py-3 text-left">Store</th>
              <th className="px-7 py-3 text-left">Title</th>
              <th className="px-7 py-3 text-left">Priority</th>
              <th className="px-7 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {filteredData.map((item, index) => (
              <tr key={index} className="border-t hover:bg-gray-50">
                <td className="px-7 py-3">{item.name}</td>
                <td className="px-7 py-3">{item.email}</td>
                <td className="px-7 py-3">{item.mobile}</td>
                <td className="px-7 py-3">{item.store}</td>
                <td className="px-7 py-3">{item.title}</td>
                <td className="px-7 py-3">
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      item.priority === 'High'
                        ? 'bg-red-100 text-red-600'
                        : item.priority === 'Medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {item.priority}
                  </span>
                </td>
                <td className="px-9 py-6 flex gap-1 flex-wrap">
                  <button className="bg-green-500 hover:bg-green-600 text-white text-[10px] px-2 py-0.5 rounded">
                    Resolve
                  </button>
                  <button className="bg-red-500 hover:bg-red-600 text-white text-[10px] px-2 py-0.5 rounded">
                    Reject
                  </button>
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded"
                    aria-label="View Details"
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-gray-500 py-4">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Merchant Ticket Details</h2>

            <div className="mb-4">
              <span className="block text-sm text-gray-500 font-medium mb-1">Title</span>
              <div className="text-gray-800 text-sm">{selectedItem.title}</div>
            </div>

            <div className="mb-4">
              <span className="block text-sm text-gray-500 font-medium mb-1">Description</span>
              <div className="text-gray-800 text-sm">{selectedItem.description}</div>
            </div>

            {selectedItem.image && (
              <div className="mb-2">
                <span className="block text-sm text-gray-500 font-medium mb-1">Image</span>
                <img
                  src={selectedItem.image}
                  alt="Attached"
                  className="w-full rounded-md border border-gray-200 shadow"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchantSupport;
