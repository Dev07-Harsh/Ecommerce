import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  Users,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Store,
  Package,
  CreditCard,
  Activity,
  ArrowUpIcon,
  ArrowDownIcon,
  UserPlus,
  ShoppingCart
} from "lucide-react";

// Sample data for charts
const monthlyRevenueData = [
  { month: 'Jan', revenue: 65000, orders: 420, merchants: 15 },
  { month: 'Feb', revenue: 78000, orders: 520, merchants: 18 },
  { month: 'Mar', revenue: 85000, orders: 580, merchants: 22 },
  { month: 'Apr', revenue: 92000, orders: 640, merchants: 25 },
  { month: 'May', revenue: 105000, orders: 720, merchants: 28 },
  { month: 'Jun', revenue: 118000, orders: 800, merchants: 32 }
];

const userGrowthData = [
  { month: 'Jan', customers: 1200, merchants: 45 },
  { month: 'Feb', customers: 1450, merchants: 52 },
  { month: 'Mar', customers: 1680, merchants: 58 },
  { month: 'Apr', customers: 1920, merchants: 65 },
  { month: 'May', customers: 2250, merchants: 72 },
  { month: 'Jun', customers: 2580, merchants: 78 }
];

const categoryData = [
  { name: 'Electronics', value: 35, color: '#FF6B35' },
  { name: 'Clothing', value: 28, color: '#F7931E' },
  { name: 'Books', value: 18, color: '#FFD23F' },
  { name: 'Home & Garden', value: 12, color: '#06FFA5' },
  { name: 'Sports', value: 7, color: '#4ECDC4' }
];

const topMerchants = [
  { name: 'TechStore Pro', revenue: '$45,230', orders: 156, growth: '+23%' },
  { name: 'Fashion Hub', revenue: '$38,940', orders: 142, growth: '+18%' },
  { name: 'Book Haven', revenue: '$32,110', orders: 98, growth: '+15%' },
  { name: 'Sports Gear', revenue: '$28,560', orders: 87, growth: '+12%' },
  { name: 'Home Essentials', revenue: '$25,890', orders: 76, growth: '+8%' }
];

const recentActivity = [
  { action: 'New merchant registered', user: 'Digital Dynamics', time: '2 minutes ago', type: 'merchant' },
  { action: 'Large order placed', user: 'Customer #4521', time: '5 minutes ago', type: 'order' },
  { action: 'Product approved', user: 'TechStore Pro', time: '12 minutes ago', type: 'product' },
  { action: 'Payment processed', user: 'Order #7834', time: '18 minutes ago', type: 'payment' },
  { action: 'User verification completed', user: 'Sarah Wilson', time: '25 minutes ago', type: 'user' }
];

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('6months');
  const [loading, setLoading] = useState(false);

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Platform Analytics</h1>
            <p className="text-gray-600 mt-1">Overview of platform performance and key metrics</p>
          </div>
          
          <div className="flex items-center gap-3">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="1month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
            </select>
            
            <button 
              onClick={refreshData}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
            >
              <Activity className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Total Revenue",
            value: "$543,250",
            change: "+23.5%",
            trend: "up",
            icon: DollarSign,
            color: "green"
          },
          {
            title: "Active Users",
            value: "12,847",
            change: "+18.2%",
            trend: "up",
            icon: Users,
            color: "blue"
          },
          {
            title: "Total Merchants",
            value: "487",
            change: "+12.8%",
            trend: "up",
            icon: Store,
            color: "purple"
          },
          {
            title: "Orders This Month",
            value: "3,249",
            change: "+8.4%",
            trend: "up",
            icon: ShoppingBag,
            color: "orange"
          }
        ].map((metric, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-lg bg-${metric.color}-100`}>
                <metric.icon className={`w-6 h-6 text-${metric.color}-600`} />
              </div>
              <div className={`flex items-center text-sm font-medium ${
                metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.trend === 'up' ? <ArrowUpIcon className="w-4 h-4 mr-1" /> : <ArrowDownIcon className="w-4 h-4 mr-1" />}
                {metric.change}
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mt-4">{metric.title}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue & Orders Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue & Orders Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value, name) => [
                name === 'revenue' ? `$${value.toLocaleString()}` : value,
                name === 'revenue' ? 'Revenue' : 'Orders'
              ]} />
              <Area type="monotone" dataKey="revenue" stackId="1" stroke="#FF6B35" fill="#FF6B35" fillOpacity={0.8} />
              <Area type="monotone" dataKey="orders" stackId="2" stroke="#4ECDC4" fill="#4ECDC4" fillOpacity={0.8} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* User Growth Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="customers" stroke="#FF6B35" strokeWidth={3} dot={{ fill: '#FF6B35' }} />
              <Line type="monotone" dataKey="merchants" stroke="#4ECDC4" strokeWidth={3} dot={{ fill: '#4ECDC4' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Categories</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Merchants */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Merchants</h3>
          <div className="space-y-4">
            {topMerchants.map((merchant, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div>
                  <p className="font-medium text-gray-900">{merchant.name}</p>
                  <p className="text-sm text-gray-600">{merchant.orders} orders</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{merchant.revenue}</p>
                  <p className="text-sm text-green-600">{merchant.growth}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${
                  activity.type === 'merchant' ? 'bg-purple-100' :
                  activity.type === 'order' ? 'bg-green-100' :
                  activity.type === 'product' ? 'bg-blue-100' :
                  activity.type === 'payment' ? 'bg-yellow-100' : 'bg-gray-100'
                }`}>
                  {activity.type === 'merchant' && <Store className="w-4 h-4 text-purple-600" />}
                  {activity.type === 'order' && <ShoppingCart className="w-4 h-4 text-green-600" />}
                  {activity.type === 'product' && <Package className="w-4 h-4 text-blue-600" />}
                  {activity.type === 'payment' && <CreditCard className="w-4 h-4 text-yellow-600" />}
                  {activity.type === 'user' && <UserPlus className="w-4 h-4 text-gray-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.user}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-gray-600 text-sm font-medium">Conversion Rate</h3>
              <p className="text-2xl font-bold text-gray-900">3.42%</p>
              <p className="text-sm text-green-600">+0.3% from last month</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-gray-600 text-sm font-medium">Avg Order Value</h3>
              <p className="text-2xl font-bold text-gray-900">$167.32</p>
              <p className="text-sm text-blue-600">+$12.50 from last month</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-gray-600 text-sm font-medium">Total Products</h3>
              <p className="text-2xl font-bold text-gray-900">15,847</p>
              <p className="text-sm text-purple-600">+1,234 this month</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


