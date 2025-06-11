import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Download, Filter, RefreshCw, ChevronDown } from 'lucide-react';

// Sample data - in a real app, this would come from an API
const sampleSalesData = [
  {
    id: 1,
    month: 'Jan',
    productName: 'Laptop Pro',
    category: 'Electronics',
    price: 1299,
    quantity: 45,
    revenue: 58455,
    merchant: 'TechGiant',
    merchantRating: 4.8
  },
  {
    id: 2,
    month: 'Jan',
    productName: 'Wireless Earbuds',
    category: 'Audio',
    price: 129,
    quantity: 230,
    revenue: 29670,
    merchant: 'AudioHub',
    merchantRating: 4.3
  },
  {
    id: 3, 
    month: 'Feb',
    productName: 'Laptop Pro',
    category: 'Electronics',
    price: 1299,
    quantity: 52,
    revenue: 67548,
    merchant: 'TechGiant',
    merchantRating: 4.8
  },
  {
    id: 4,
    month: 'Feb',
    productName: 'Wireless Earbuds',
    category: 'Audio',
    price: 129,
    quantity: 185,
    revenue: 23865,
    merchant: 'AudioHub',
    merchantRating: 4.3
  },
  {
    id: 5,
    month: 'Mar',
    productName: 'Laptop Pro',
    category: 'Electronics',
    price: 1299,
    quantity: 63,
    revenue: 81837,
    merchant: 'TechGiant',
    merchantRating: 4.8
  },
  {
    id: 6,
    month: 'Mar',
    productName: 'Wireless Earbuds',
    category: 'Audio',
    price: 129,
    quantity: 310,
    revenue: 39990,
    merchant: 'AudioHub',
    merchantRating: 4.3
  },
  {
    id: 7,
    month: 'Mar',
    productName: 'Smart Watch',
    category: 'Wearables',
    price: 249,
    quantity: 125,
    revenue: 31125,
    merchant: 'WearTech',
    merchantRating: 4.5
  },
  {
    id: 8,
    month: 'Apr',
    productName: 'Laptop Pro',
    category: 'Electronics',
    price: 1299,
    quantity: 48,
    revenue: 62352,
    merchant: 'TechGiant',
    merchantRating: 4.8
  },
  {
    id: 9,
    month: 'Apr',
    productName: 'Wireless Earbuds',
    category: 'Audio',
    price: 129,
    quantity: 195,
    revenue: 25155,
    merchant: 'AudioHub',
    merchantRating: 4.3
  },
  {
    id: 10,
    month: 'Apr',
    productName: 'Smart Watch',
    category: 'Wearables',
    price: 249,
    quantity: 180,
    revenue: 44820,
    merchant: 'WearTech',
    merchantRating: 4.6
  },
  {
    id: 11,
    month: 'May',
    productName: 'Laptop Pro',
    category: 'Electronics',
    price: 1299,
    quantity: 71,
    revenue: 92229,
    merchant: 'TechGiant',
    merchantRating: 4.9
  },
  {
    id: 12,
    month: 'May',
    productName: 'Wireless Earbuds',
    category: 'Audio',
    price: 129,
    quantity: 275,
    revenue: 35475,
    merchant: 'AudioHub',
    merchantRating: 4.4
  },
  {
    id: 13,
    month: 'May',
    productName: 'Smart Watch',
    category: 'Wearables',
    price: 249,
    quantity: 210,
    revenue: 52290,
    merchant: 'WearTech',
    merchantRating: 4.6
  }
];

// Update the COLORS constant
const CHART_COLORS = {
  primary: '#FF5733',
  secondary: '#2DD4BF',
  tertiary: '#A855F7',
  quaternary: '#3B82F6',
  background: '#FFF5E6'
};

export default function SalesReport() {
  const [reportData, setReportData] = useState(sampleSalesData);
  const [dateRange, setDateRange] = useState('last-6-months');
  const [filterProduct, setFilterProduct] = useState('all');
  const [filterMerchant, setFilterMerchant] = useState('all');
  const [sortBy, setSortBy] = useState('revenue');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Calculate summary metrics
  const totalRevenue = reportData.reduce((sum, item) => sum + item.revenue, 0);
  const totalSales = reportData.reduce((sum, item) => sum + item.quantity, 0);
  const averageOrderValue = totalRevenue / totalSales;
  
  // Get unique products and merchants for filters
  const uniqueProducts = [...new Set(sampleSalesData.map(item => item.productName))];
  const uniqueMerchants = [...new Set(sampleSalesData.map(item => item.merchant))];

  // Product performance data
  const productPerformance = uniqueProducts.map(product => {
    const productData = reportData.filter(item => item.productName === product);
    const productRevenue = productData.reduce((sum, item) => sum + item.revenue, 0);
    const productSales = productData.reduce((sum, item) => sum + item.quantity, 0);
    
    return {
      name: product,
      revenue: productRevenue,
      sales: productSales,
      averagePrice: productRevenue / productSales
    };
  }).sort((a, b) => {
    // Define a type for the product performance object
    type ProductPerformance = {
      name: string;
      revenue: number;
      sales: number;
      averagePrice: number;
    };
    
    // Properly type the parameters
    const aValue = a[sortBy as keyof ProductPerformance];
    const bValue = b[sortBy as keyof ProductPerformance];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return bValue.localeCompare(aValue);
    }
    return (bValue as number) - (aValue as number);
  });

  // Merchant performance data
  const merchantPerformance = uniqueMerchants.map(merchant => {
    const merchantData = reportData.filter(item => item.merchant === merchant);
    const merchantRevenue = merchantData.reduce((sum, item) => sum + item.revenue, 0);
    const merchantSales = merchantData.reduce((sum, item) => sum + item.quantity, 0);
    const merchantRating = merchantData[0].merchantRating;
    
    return {
      name: merchant,
      revenue: merchantRevenue,
      sales: merchantSales,
      rating: merchantRating
    };
  }).sort((a, b) => b.revenue - a.revenue);

  // Monthly trend data for charts
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
  const monthlyTrends = months.map(month => {
    const monthData = reportData.filter(item => item.month === month);
    const monthRevenue = monthData.reduce((sum, item) => sum + item.revenue, 0);
    const monthSales = monthData.reduce((sum, item) => sum + item.quantity, 0);
    
    return {
      name: month,
      revenue: monthRevenue,
      sales: monthSales
    };
  });

  // Category distribution data for pie chart
  const categoryData = reportData.reduce<Record<string, number>>((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = 0;
    }
    acc[item.category] += item.revenue;
    return acc;
  }, {});

  const categoryPieData = Object.keys(categoryData).map(category => ({
    name: category,
    value: categoryData[category]
  }));

  // Handle filter changes
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate API call with setTimeout
    setTimeout(() => {
      let filteredData = [...sampleSalesData];
      
      // Apply product filter
      if (filterProduct !== 'all') {
        filteredData = filteredData.filter(item => item.productName === filterProduct);
      }
      
      // Apply merchant filter
      if (filterMerchant !== 'all') {
        filteredData = filteredData.filter(item => item.merchant === filterMerchant);
      }
      
      // Apply search term
      if (searchTerm) {
        filteredData = filteredData.filter(item => 
          item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setReportData(filteredData);
      setIsLoading(false);
    }, 500);
  }, [filterProduct, filterMerchant, searchTerm]);

  // Handle data refresh
  const refreshData = () => {
    setIsLoading(true);
    // In a real app, this would fetch new data from an API
    setTimeout(() => {
      setReportData(sampleSalesData);
      setIsLoading(false);
    }, 800);
  };

  // Format currency
  const formatCurrency = (value:number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="bg-white min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with updated styling */}
        <div className="bg-white rounded-lg shadow-lg mb-8 p-6" style={{background: 'linear-gradient(135deg, #FF5733 0%, #FF8C33 100%)'}}>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">Sales Performance Report</h1>
            <div className="flex space-x-4">
              <button 
                onClick={refreshData}
                className="flex items-center gap-2 bg-white text-[#FF5733] px-4 py-2 rounded-lg font-medium hover:bg-white/80 transition-all duration-300 group border border-[#FF5733]"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                Refresh Data
              </button>
              <button 
                className="flex items-center gap-2 bg-[#FF5733] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#FF4500] transition-all duration-300 border border-[#FF5733]"
              >
                <Download className="w-5 h-5" />
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards with enhanced styling */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg border-l-4" style={{borderLeftColor: '#FF5733'}}>
            <h3 className="text-gray-500 text-sm font-medium mb-1">Total Revenue</h3>
            <div className="flex items-end">
              <p className="text-2xl font-bold" style={{color: '#FF5733'}}>{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg border-l-4" style={{borderLeftColor: '#FF5733'}}>
            <h3 className="text-gray-500 text-sm font-medium mb-1">Total Sales</h3>
            <div className="flex items-end">
              <p className="text-2xl font-bold" style={{color: '#FF5733'}}>{totalSales.toLocaleString()}</p>
              <p className="text-sm text-gray-500 ml-2 mb-1">units</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg border-l-4" style={{borderLeftColor: '#FF5733'}}>
            <h3 className="text-gray-500 text-sm font-medium mb-1">Average Order Value</h3>
            <div className="flex items-end">
              <p className="text-2xl font-bold" style={{color: '#FF5733'}}>{formatCurrency(averageOrderValue)}</p>
            </div>
          </div>
        </div>

        {/* Filters with updated styling */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <h2 className="text-lg font-medium flex items-center" style={{color: '#FF5733'}}>
              <Filter className="w-5 h-5 mr-2" style={{color: '#FF5733'}} />
              Filter Options
            </h2>
            <div className="flex flex-wrap gap-4">
              <div className="w-full md:w-auto">
                <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                <select
                  value={filterProduct}
                  onChange={(e) => setFilterProduct(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:border-2 focus:border-opacity-50 sm:text-sm rounded-md"
                  style={{focusBorderColor: '#FF5733'}}
                >
                  <option value="all">All Products</option>
                  {uniqueProducts.map(product => (
                    <option key={product} value={product}>{product}</option>
                  ))}
                </select>
              </div>
              <div className="w-full md:w-auto">
                <label className="block text-sm font-medium text-gray-700 mb-1">Merchant</label>
                <select
                  value={filterMerchant}
                  onChange={(e) => setFilterMerchant(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:border-2 focus:border-opacity-50 sm:text-sm rounded-md"
                  style={{focusBorderColor: '#FF5733'}}
                >
                  <option value="all">All Merchants</option>
                  {uniqueMerchants.map(merchant => (
                    <option key={merchant} value={merchant}>{merchant}</option>
                  ))}
                </select>
              </div>
              <div className="w-full md:w-auto">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search products or merchants"
                    className="focus:ring-2 focus:ring-opacity-50 focus:border-2 focus:border-opacity-50 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md py-2"
                    style={{focusRingColor: '#FF5733', focusBorderColor: '#FF5733'}}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue and Sales Trend Chart with updated colors */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-lg font-medium mb-4" style={{color: '#FF5733'}}>Revenue & Sales Trend</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrends} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip formatter={(value, name) => [
  name === 'revenue' ? formatCurrency(Number(value)) : value.toLocaleString(), 
  name === 'revenue' ? 'Revenue' : 'Units Sold'
]} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="revenue" name="Revenue" stroke={CHART_COLORS.primary} strokeWidth={3} activeDot={{ r: 8, fill: CHART_COLORS.primary }} />
                <Line yAxisId="right" type="monotone" dataKey="sales" name="Units Sold" stroke={CHART_COLORS.secondary} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Performance with updated colors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium" style={{color: '#FF5733'}}>Product Performance</h2>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="block pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:border-2 focus:border-opacity-50 rounded-md"
                style={{focusBorderColor: '#FF5733'}}
              >
                <option value="revenue">Sort by Revenue</option>
                <option value="sales">Sort by Sales</option>
              </select>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productPerformance} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue" fill={CHART_COLORS.primary} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution with updated colors */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-medium mb-4" style={{color: '#FF5733'}}>Revenue by Category</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={Object.values(CHART_COLORS)[index % 4]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Merchant Performance Table with updated styling */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-lg font-medium mb-4" style={{color: '#FF5733'}}>Merchant Performance</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead style={{backgroundColor: '#FF5733'}}>
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Merchant
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Revenue
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Units Sold
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Rating
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {merchantPerformance.map((merchant, idx) => (
                  <tr key={merchant.name} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                      {merchant.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(merchant.revenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {merchant.sales.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                          merchant.rating >= 4.5 ? 'bg-green-500' : 
                          merchant.rating >= 4.0 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></span>
                        {merchant.rating.toFixed(1)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Sales Table with updated styling */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-medium mb-4" style={{color: '#FF5733'}}>Detailed Sales Data</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead style={{backgroundColor: '#FF5733'}}>
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Month
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Quantity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Revenue
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Merchant
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.map((item, idx) => (
                  <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                      {item.productName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(item.revenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.merchant}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {isLoading && (
            <div className="flex justify-center items-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{borderColor: '#FF5733'}}></div>
              <span className="ml-2 text-gray-500">Loading data...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}