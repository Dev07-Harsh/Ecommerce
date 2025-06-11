import React, { useState } from 'react';
import { 
  FunnelIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateJoined: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderDate: string;
  status: 'Active' | 'Inactive';
  avatar?: string;
}

// Mock customers data
const CUSTOMERS: Customer[] = [
  {
    id: 'CUS-001',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 555-123-4567',
    dateJoined: '2023-05-10',
    ordersCount: 8,
    totalSpent: 423.45,
    lastOrderDate: '2023-08-15',
    status: 'Active',
    avatar: 'https://placehold.co/40x40',
  },
  {
    id: 'CUS-002',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1 555-987-6543',
    dateJoined: '2023-04-22',
    ordersCount: 5,
    totalSpent: 287.99,
    lastOrderDate: '2023-08-14',
    status: 'Active',
    avatar: 'https://placehold.co/40x40',
  },
  {
    id: 'CUS-003',
    name: 'Robert Johnson',
    email: 'robert@example.com',
    phone: '+1 555-567-8901',
    dateJoined: '2023-06-05',
    ordersCount: 2,
    totalSpent: 129.98,
    lastOrderDate: '2023-08-14',
    status: 'Active',
    avatar: 'https://placehold.co/40x40',
  },
  {
    id: 'CUS-004',
    name: 'Emily Wilson',
    email: 'emily@example.com',
    phone: '+1 555-345-6789',
    dateJoined: '2023-05-17',
    ordersCount: 4,
    totalSpent: 329.50,
    lastOrderDate: '2023-08-13',
    status: 'Active',
    avatar: 'https://placehold.co/40x40',
  },
  {
    id: 'CUS-005',
    name: 'Michael Brown',
    email: 'michael@example.com',
    phone: '+1 555-234-5678',
    dateJoined: '2023-02-28',
    ordersCount: 12,
    totalSpent: 645.75,
    lastOrderDate: '2023-08-12',
    status: 'Active',
    avatar: 'https://placehold.co/40x40',
  },
  {
    id: 'CUS-006',
    name: 'Sarah Davis',
    email: 'sarah@example.com',
    phone: '+1 555-876-5432',
    dateJoined: '2023-07-11',
    ordersCount: 1,
    totalSpent: 78.50,
    lastOrderDate: '2023-08-11',
    status: 'Active',
    avatar: 'https://placehold.co/40x40',
  },
  {
    id: 'CUS-007',
    name: 'David Miller',
    email: 'david@example.com',
    phone: '+1 555-654-3210',
    dateJoined: '2023-01-05',
    ordersCount: 9,
    totalSpent: 512.89,
    lastOrderDate: '2023-08-10',
    status: 'Inactive',
    avatar: 'https://placehold.co/40x40',
  },
  {
    id: 'CUS-008',
    name: 'Lisa Garcia',
    email: 'lisa@example.com',
    phone: '+1 555-789-0123',
    dateJoined: '2023-03-19',
    ordersCount: 6,
    totalSpent: 398.94,
    lastOrderDate: '2023-08-09',
    status: 'Active',
    avatar: 'https://placehold.co/40x40',
  },
];

// Status badge component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let bgColor = '';
  let textColor = '';
  
  switch (status) {
    case 'Active':
      bgColor = 'bg-emerald-100';
      textColor = 'text-emerald-800';
      break;
    case 'Inactive':
      bgColor = 'bg-rose-100';
      textColor = 'text-rose-800';
      break;
    default:
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {status}
    </span>
  );
};

const Customers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Customer | null;
    direction: 'ascending' | 'descending';
  }>({
    key: 'lastOrderDate',
    direction: 'descending',
  });
  
  // Handle sort
  const requestSort = (key: keyof Customer) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  // Filter customers based on search and status
  const filteredCustomers = CUSTOMERS.filter((customer) => {
    // Search filter (search by name, email, or phone)
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);
    
    // Status filter
    const matchesStatus =
      selectedStatus === 'All' || customer.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });
  
  // Sort customers
  const sortedCustomers = React.useMemo(() => {
    let sortableCustomers = [...filteredCustomers];
    if (sortConfig.key !== null) {
      sortableCustomers.sort((a, b) => {
        if (sortConfig.key === null) {
          return 0;
        }

        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue === undefined || bValue === undefined) {
          return 0;
        }
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'ascending'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableCustomers;
  }, [filteredCustomers, sortConfig]);
  
  // Generate sort indicator
  const getSortIndicator = (key: keyof Customer) => {
    if (sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'ascending' ? (
      <ArrowUpIcon className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDownIcon className="h-4 w-4 ml-1" />
    );
  };
  
  // Customer stats
  const customerStats = [
    {
      title: 'Total Customers',
      value: CUSTOMERS.length,
    },
    {
      title: 'Active Customers',
      value: CUSTOMERS.filter(c => c.status === 'Active').length,
    },
    {
      title: 'Average Orders',
      value: (CUSTOMERS.reduce((acc, c) => acc + c.ordersCount, 0) / CUSTOMERS.length).toFixed(1),
    },
    {
      title: 'Average Spend',
      value: `$${(CUSTOMERS.reduce((acc, c) => acc + c.totalSpent, 0) / CUSTOMERS.length).toFixed(2)}`,
    },
  ];
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
        <div className="flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
            <EnvelopeIcon className="h-4 w-4 mr-2" />
            Export
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
            <UserIcon className="h-4 w-4 mr-2" />
            Add Customer
          </button>
        </div>
      </div>
      
      {/* Customer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {customerStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm p-5 border border-gray-200"
          >
            <p className="text-sm font-medium text-gray-500">{stat.title}</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
              <input
                type="text"
              placeholder="Search customers..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
                <select
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
            <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
          <select className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm">
            <option value="">Sort By</option>
            <option value="name">Name</option>
            <option value="dateJoined">Date Joined</option>
            <option value="ordersCount">Orders Count</option>
            <option value="totalSpent">Total Spent</option>
                </select>
          <button className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
            <FunnelIcon className="h-4 w-4 mr-2" />
            More Filters
          </button>
        </div>
        </div>
        
      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Customer', 'Contact', 'Date Joined', 'Orders', 'Total Spent', 'Last Order', 'Status', 'Actions'].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-orange-600"
                    onClick={() => requestSort(header.toLowerCase() as keyof Customer)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{header}</span>
                      {getSortIndicator(header.toLowerCase() as keyof Customer)}
                  </div>
                </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-orange-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={customer.avatar}
                          alt={customer.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-500">{customer.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customer.email}</div>
                    <div className="text-sm text-gray-500">{customer.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.dateJoined}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.ordersCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${customer.totalSpent.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.lastOrderDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={customer.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button className="text-orange-600 hover:text-orange-900">
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button className="text-orange-600 hover:text-orange-900">
                        <EnvelopeIcon className="h-5 w-5" />
                      </button>
                      <button className="text-orange-600 hover:text-orange-900">
                        <PhoneIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Customers; 