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
  ShoppingCart,
  Loader2
} from "lucide-react";
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import YouTubeNotification from '../../components/YouTubeNotification';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface DashboardMetrics {
  revenue: {
    current: number;
    previous: number;
    change_percentage: number;
    currency: string;
  };
  active_users: {
    current: number;
    previous: number;
    change_percentage: number;
  };
  total_merchants: {
    current: number;
    previous: number;
    change_percentage: number;
  };
  monthly_orders: {
    count: {
      current: number;
      previous: number;
      change_percentage: number;
    };
    amount: {
      current: number;
      previous: number;
      change_percentage: number;
      currency: string;
    };
    month: string;
  };
  average_order_value: {
    current: number;
    previous: number;
    change_percentage: number;
    currency: string;
  };
  total_products: {
    current: number;
    previous: number;
    total_active: number;
    change_percentage: number;
  };
}

interface TrendData {
  month: string;
  revenue: number;
  orders: number;
  average_order_value: number;
}

interface TrendResponse {
  status: string;
  data: {
    trend: TrendData[];
    summary: {
      total_revenue: number;
      total_orders: number;
      average_order_value: number;
      currency: string;
    };
  };
  message?: string;
}

interface UserGrowthData {
  month: string;
  users: number;
  merchants: number;
  cumulative_users: number;
  cumulative_merchants: number;
}

interface UserGrowthResponse {
  status: string;
  data: {
    trend: UserGrowthData[];
    summary: {
      total_users: number;
      total_merchants: number;
      average_user_growth: number;
      average_merchant_growth: number;
    };
  };
  message?: string;
}

interface CategoryDistribution {
  name: string;
  value: number;
  count: number;
  color: string;
}

interface CategoryDistributionResponse {
  status: string;
  data: {
    categories: CategoryDistribution[];
    total_products: number;
  };
  message?: string;
}

interface TopMerchant {
  name: string;
  revenue: string;
  orders: number;
  growth: string;
}

interface TopMerchantsResponse {
  status: string;
  data: {
    merchants: TopMerchant[];
  };
  message?: string;
}

interface ConversionRateData {
  monthly_breakdown: Array<{
    month: string;
    conversion_rate: number;
    purchases: number;
    visitors: number;
  }>;
  overall: {
    conversion_rate: number;
    total_purchases: number;
    total_visitors: number;
  };
  summary: {
    average_monthly_conversion: number;
    best_month: {
      month: string;
      conversion_rate: number;
      purchases: number;
      visitors: number;
    };
    worst_month: {
      month: string;
      conversion_rate: number;
      purchases: number;
      visitors: number;
    };
  };
}

interface ConversionRateResponse {
  status: string;
  data: ConversionRateData;
  message?: string;
}

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('6months');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { accessToken, user } = useAuth();
  const [userGrowthData, setUserGrowthData] = useState<UserGrowthData[]>([]);
  const [averageOrderValue, setAverageOrderValue] = useState<{
    current: number;
    previous: number;
    change_percentage: number;
    currency: string;
  } | null>(null);
  const [totalProducts, setTotalProducts] = useState<{
    current: number;
    previous: number;
    total_active: number;
    change_percentage: number;
  } | null>(null);
  const [categoryData, setCategoryData] = useState<CategoryDistribution[]>([]);
  const [topMerchants, setTopMerchants] = useState<TopMerchant[]>([]);
  const [conversionRate, setConversionRate] = useState<ConversionRateData | null>(null);

  const formatMonth = (dateStr: string) => {
    const [year, month] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString('default', { month: 'short' });
  };

  // Helper function to get months parameter from timeRange
  const getMonthsFromTimeRange = (timeRange: string): number => {
    switch (timeRange) {
      case '1month': return 1;
      case '3months': return 3;
      case '6months': return 6;
      case '1year': return 12;
      default: return 6;
    }
  };

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      const months = getMonthsFromTimeRange(timeRange);
      
      // Use the new period-based dashboard endpoint
      const response = await fetch(`${API_BASE_URL}/api/superadmin/analytics/dashboard-by-period?months=${months}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard metrics');
      }

      const data = await response.json();
      if (data.status === 'success') {
        setMetrics(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch metrics');
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
      setError('Failed to load dashboard metrics. Please try again later.');
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendData = async () => {
    try {
      const months = getMonthsFromTimeRange(timeRange);
      const response = await fetch(`${API_BASE_URL}/api/superadmin/analytics/revenue-orders-trend?months=${months}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch trend data');
      }

      const data: TrendResponse = await response.json();
      if (data.status === 'success') {
        // Format the month display in the trend data
        const formattedData = data.data.trend.map(item => ({
          ...item,
          month: formatMonth(item.month)
        }));
        setTrendData(formattedData);
      } else {
        throw new Error(data.message || 'Failed to fetch trend data');
      }
    } catch (error) {
      console.error('Error fetching trend data:', error);
      toast.error('Failed to load trend data');
    }
  };

  const fetchUserGrowthData = async () => {
    try {
      const months = getMonthsFromTimeRange(timeRange);
      const response = await fetch(`${API_BASE_URL}/api/superadmin/analytics/user-growth-trend?months=${months}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch user growth data');
      }

      const data: UserGrowthResponse = await response.json();
      // console.log('Raw API Response:', data);

      if (data.status === 'success' && data.data?.trend) {
        // Format the trend data for the chart
        const formattedData = data.data.trend.map(item => ({
          month: formatMonth(item.month),
          users: item.cumulative_users,
          merchants: item.cumulative_merchants,
          cumulative_users: item.cumulative_users,
          cumulative_merchants: item.cumulative_merchants
        }));
        
        // console.log('Formatted user growth data:', formattedData);
        setUserGrowthData(formattedData);
      } else {
        console.error('Invalid response format:', data);
        throw new Error(data.message || 'Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching user growth data:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load user growth data');
      setUserGrowthData([]);
    }
  };

  const fetchAverageOrderValue = async () => {
    try {
      const months = getMonthsFromTimeRange(timeRange);
      const response = await fetch(`${API_BASE_URL}/api/superadmin/analytics/average-order-value-by-period?months=${months}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch average order value');
      }

      const data = await response.json();
      if (data.status === 'success') {
        setAverageOrderValue(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch average order value');
      }
    } catch (error) {
      console.error('Error fetching average order value:', error);
      toast.error('Failed to load average order value');
    }
  };

  const fetchTotalProducts = async () => {
    try {
      const months = getMonthsFromTimeRange(timeRange);
      const response = await fetch(`${API_BASE_URL}/api/superadmin/analytics/total-products-by-period?months=${months}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch total products');
      }

      const data = await response.json();
      if (data.status === 'success') {
        setTotalProducts(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch total products');
      }
    } catch (error) {
      console.error('Error fetching total products:', error);
      toast.error('Failed to load total products');
    }
  };

  const fetchCategoryDistribution = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/superadmin/analytics/category-distribution`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch category distribution data');
      }

      const data: CategoryDistributionResponse = await response.json();
      if (data.status === 'success') {
        setCategoryData(data.data.categories);
      } else {
        throw new Error(data.message || 'Failed to fetch category distribution data');
      }
    } catch (error) {
      console.error('Error fetching category distribution data:', error);
      toast.error('Failed to load category distribution data');
      setCategoryData([]);
    }
  };

  const fetchTopMerchants = async () => {
    try {
      const months = getMonthsFromTimeRange(timeRange);
      const response = await fetch(`${API_BASE_URL}/api/superadmin/analytics/merchant-performance?months=${months}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch top merchants data');
      }

      const data = await response.json();
      if (data.status === 'success') {
        // Format the merchant data to match the expected interface
        const formattedMerchants = data.data.merchants.slice(0, 5).map((merchant: any) => ({
          name: merchant.business_name,
          revenue: `₹${merchant.total_revenue.toLocaleString()}`,
          orders: merchant.total_orders,
          growth: '+0%' // Since we don't have growth data in this endpoint
        }));
        setTopMerchants(formattedMerchants);
      } else {
        throw new Error(data.message || 'Failed to fetch top merchants data');
      }
    } catch (error) {
      console.error('Error fetching top merchants data:', error);
      toast.error('Failed to load top merchants data');
      setTopMerchants([]);
    }
  };

  const fetchConversionRate = async () => {
    try {
      // console.log('Fetching conversion rate data...');
      const months = getMonthsFromTimeRange(timeRange);
      const response = await fetch(`${API_BASE_URL}/api/superadmin/analytics/conversion-rate?months=${months}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      // console.log('Conversion rate response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Failed to fetch conversion rate data');
      }

      const data: ConversionRateResponse = await response.json();
      // console.log('Conversion rate API response:', data);

      if (data.status === 'success') {
        // console.log('Setting conversion rate data:', data.data);
        setConversionRate(data.data);
      } else {
        console.error('Conversion rate API error:', data.message);
        throw new Error(data.message || 'Failed to fetch conversion rate data');
      }
    } catch (error) {
      console.error('Error fetching conversion rate:', error);
      toast.error('Failed to load conversion rate data');
    }
  };

  useEffect(() => {
    if (!user || !['admin', 'superadmin'].includes(user.role.toLowerCase())) {
      toast.error('Access denied. Admin role required.');
      return;
    }
    fetchMetrics();
    fetchTrendData();
    fetchUserGrowthData();
    fetchAverageOrderValue();
    fetchTotalProducts();
    fetchCategoryDistribution();
    fetchTopMerchants();
    fetchConversionRate();
  }, [user, timeRange]);

  const refreshData = () => {
    fetchMetrics();
    fetchTrendData();
    fetchUserGrowthData();
    fetchAverageOrderValue();
    fetchTotalProducts();
    fetchCategoryDistribution();
    fetchTopMerchants();
    fetchConversionRate();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-red-500 mb-4">
          <Activity size={48} />
        </div>
        <p className="text-xl font-semibold text-gray-800">Error</p>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={fetchMetrics}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Add debug statement in the render to see the current state
  // console.log('Current conversion rate state:', conversionRate);

  return (
    <div className="space-y-6">
      {/* YouTube Integration Notification */}
      <YouTubeNotification />
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Platform Analytics</h1>
            <p className="text-gray-600 mt-1">Overview of platform performance and key metrics</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full sm:w-fit bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="1month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
            </select>
            
            <button 
              onClick={refreshData}
              className="w-full sm:w-fit bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
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
            value: formatCurrency(metrics?.revenue?.current ?? 0),
            change: formatPercentage(metrics?.revenue?.change_percentage ?? 0),
            trend: (metrics?.revenue?.change_percentage ?? 0) >= 0 ? "up" : "down",
            icon: DollarSign,
            color: "green"
          },
          {
            title: "Active Users",
            value: metrics?.active_users?.current?.toLocaleString() ?? '0',
            change: formatPercentage(metrics?.active_users?.change_percentage ?? 0),
            trend: (metrics?.active_users?.change_percentage ?? 0) >= 0 ? "up" : "down",
            icon: Users,
            color: "blue"
          },
          {
            title: "Total Merchants",
            value: metrics?.total_merchants?.current?.toLocaleString() ?? '0',
            change: formatPercentage(metrics?.total_merchants?.change_percentage ?? 0),
            trend: (metrics?.total_merchants?.change_percentage ?? 0) >= 0 ? "up" : "down",
            icon: Store,
            color: "purple"
          },
          {
            title: `Orders (${timeRange === '1month' ? 'This Month' : timeRange === '3months' ? 'Last 3 Months' : timeRange === '6months' ? 'Last 6 Months' : 'Last Year'})`,
            value: metrics?.monthly_orders?.count?.current?.toLocaleString() ?? '0',
            change: formatPercentage(metrics?.monthly_orders?.count?.change_percentage ?? 0),
            trend: (metrics?.monthly_orders?.count?.change_percentage ?? 0) >= 0 ? "up" : "down",
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
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                interval={0}
              />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'revenue' ? formatCurrency(Number(value)) : value,
                  name === 'revenue' ? 'Revenue' : 'Orders'
                ]} 
              />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="revenue" 
                stackId="1" 
                stroke="#FF6B35" 
                fill="#FF6B35" 
                fillOpacity={0.8} 
              />
              <Area 
                yAxisId="right"
                type="monotone" 
                dataKey="orders" 
                stackId="2" 
                stroke="#4ECDC4" 
                fill="#4ECDC4" 
                fillOpacity={0.8} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* User Growth Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">User Growth</h3>
          
          {/* Stats Cards */}
          

          {/* Chart */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={userGrowthData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12, fill: '#666' }}
                  axisLine={{ stroke: '#e0e0e0' }}
                  tickLine={{ stroke: '#e0e0e0' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#666' }}
                  axisLine={{ stroke: '#e0e0e0' }}
                  tickLine={{ stroke: '#e0e0e0' }}
                  domain={[0, 'dataMax + 0.5']}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value, name) => [
                    value.toLocaleString(),
                    name === 'merchants' ? 'Merchants' : 'Users'
                  ]}
                  labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#FF6B35" 
                  strokeWidth={3} 
                  dot={{ fill: '#FF6B35', strokeWidth: 0, r: 6 }} 
                  activeDot={{ r: 8, fill: '#FF6B35' }}
                  name="users"
                />
                <Line 
                  type="monotone" 
                  dataKey="merchants" 
                  stroke="#4ECDC4" 
                  strokeWidth={3} 
                  dot={{ fill: '#4ECDC4', strokeWidth: 0, r: 6 }} 
                  activeDot={{ r: 8, fill: '#4ECDC4' }}
                  name="merchants"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex justify-center mt-4 space-x-6">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-orange-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Users</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-teal-400 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Merchants</span>
            </div>
          </div>
        </div>
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Categories</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
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
                  <Tooltip 
                    formatter={(value, name, props) => [
                      `${props.payload.count} products (${props.payload.value}%)`,
                      props.payload.name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Categories List */}
            <div className="h-[250px] overflow-y-auto pr-2">
              <div className="space-y-2">
                {categoryData.map((category, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium text-gray-900">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{category.count} products</p>
                      <p className="text-sm font-medium text-gray-900">{category.value}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
                  <p className={`text-sm ${merchant.growth.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {merchant.growth}
                  </p>
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
              <p className="text-2xl font-bold text-gray-900">
                {conversionRate?.overall?.conversion_rate !== undefined 
                  ? `${conversionRate.overall.conversion_rate.toFixed(2)}%` 
                  : 'Loading...'}
              </p>
              <div className="text-sm text-gray-600">
                <p>Total Visitors: {conversionRate?.overall?.total_visitors || 0}</p>
                <p>Total Purchases: {conversionRate?.overall?.total_purchases || 0}</p>
              </div>
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
              <p className="text-2xl font-bold text-gray-900">
                {averageOrderValue ? formatCurrency(averageOrderValue.current) : 'Loading...'}
              </p>
              <p className={`text-sm ${(averageOrderValue?.change_percentage ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {averageOrderValue ? `${(averageOrderValue.change_percentage ?? 0) >= 0 ? '+' : ''}${(averageOrderValue.change_percentage ?? 0).toFixed(1)}% from last month` : ''}
              </p>
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
              <p className="text-2xl font-bold text-gray-900">
                {totalProducts ? totalProducts.total_active.toLocaleString() : 'Loading...'}
              </p>
              <p className={`text-sm ${(totalProducts?.change_percentage ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalProducts ? `${(totalProducts.change_percentage ?? 0) >= 0 ? '+' : ''}${(totalProducts.change_percentage ?? 0).toFixed(1)}% this month` : ''}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


