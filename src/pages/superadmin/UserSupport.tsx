import React, { useState } from 'react';
import { Eye, X } from 'lucide-react';

const userSupportData = [
  {
    name: 'Ravi Kumar',
    email: 'ravi@example.com',
    mobile: '9876543210',
    title: 'Issue with login',
    priority: 'High',
    description: 'User cannot log in after recent password reset.',
    image: 'https://via.placeholder.com/150?text=Login+Issue',
  },
  {
    name: 'Neha Mehta',
    email: 'neha@example.com',
    mobile: '9123456789',
    title: 'Order not received',
    priority: 'Medium',
    description: 'Customer has not received the order placed 10 days ago.',
    image: 'https://via.placeholder.com/150?text=Order+Issue',
  },
  {
    name: 'Amit Shah',
    email: 'amit@example.com',
    mobile: '9988776655',
    title: 'Refund status',
    priority: 'Low',
    description: 'Inquiry about refund processing time.',
    image: 'https://via.placeholder.com/150?text=Refund+Status',
  },
  {
    name: 'Priya Nair',
    email: 'priya@example.com',
    mobile: '9856321470',
    title: 'App crash issue',
    priority: 'High',
    description: 'App crashes when trying to upload images.',
    image: 'https://via.placeholder.com/150?text=App+Crash',
  },
];

const UserSupport: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const filteredData = userSupportData.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPriority =
      priorityFilter === 'All' || item.priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  return (
    <div className="p-8 relative">
      <h1 className="text-2xl font-bold mb-6">User Support</h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
        <input
          type="text"
          placeholder="Search name, email or title..."
          className="px-4 py-2 border border-gray-300 rounded-md w-full md:w-1/3 text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="All">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white text-sm rounded-lg overflow-hidden shadow border border-gray-200">
          <thead className="bg-orange-50 text-orange-400 font-semibold">
            <tr>
              <th className="px-6 py-4 text-left">Name</th>
              <th className="px-6 py-4 text-left">Email</th>
              <th className="px-6 py-4 text-left">Mobile Number</th>
              <th className="px-6 py-4 text-left">Title</th>
              <th className="px-6 py-4 text-left">Priority</th>
              <th className="px-6 py-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {filteredData.map((item, index) => (
              <tr key={index} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4">{item.name}</td>
                <td className="px-6 py-4">{item.email}</td>
                <td className="px-6 py-4">{item.mobile}</td>
                <td className="px-6 py-4">{item.title}</td>
                <td className="px-6 py-4">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
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
                <td className="px-4 py-4 flex gap-2 flex-wrap">
                  <button className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded">
                    Resolve
                  </button>
                  <button className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded">
                    Reject
                  </button>
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
                    onClick={() => setSelectedItem(item)}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-gray-500 py-6">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
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

      <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Support Ticket Details</h2>

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

export default UserSupport;
