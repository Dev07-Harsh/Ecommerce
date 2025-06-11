import React, { useEffect, useState } from "react";
import {
  Activity,
  UserCircle2,
  Download,
  Search,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  RefreshCw,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Mock fallback data
const fallbackActivities = [
  { id: 1, user: "John Doe", activity: "Logged in", timestamp: "2025-05-02 09:15 AM" },
  { id: 2, user: "Jane Smith", activity: "Viewed Order #1023", timestamp: "2025-05-02 09:20 AM" },
  { id: 3, user: "Alice Johnson", activity: "Updated Profile", timestamp: "2025-05-02 09:45 AM" },
];

const fallbackChartData = [
  { date: "Apr 26", actions: 12 },
  { date: "Apr 27", actions: 18 },
  { date: "Apr 28", actions: 9 },
  { date: "Apr 29", actions: 20 },
  { date: "Apr 30", actions: 25 },
  { date: "May 1", actions: 15 },
  { date: "May 2", actions: 22 },
];

const fallbackTopUsers = [
  { user: "John Doe", count: 25 },
  { user: "Jane Smith", count: 20 },
  { user: "Alice Johnson", count: 15 },
  { user: "Bob Martin", count: 10 },
  { user: "Sara Lee", count: 8 },
];

const fallbackActivityTypes = [
  { type: "Login", count: 40 },
  { type: "Profile Update", count: 25 },
  { type: "Order Viewed", count: 30 },
  { type: "Logged Out", count: 10 },
];

const COLORS = ['#FF5733', '#FF8C33', '#FF4500', '#FFF5E6'];

const UserActivity = () => {
  const [activities, setActivities] = useState(fallbackActivities);
  const [chartData, setChartData] = useState(fallbackChartData);
  const [topUsers, setTopUsers] = useState(fallbackTopUsers);
  const [activityTypes, setActivityTypes] = useState(fallbackActivityTypes);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("line");

  useEffect(() => {
    // Future: Replace with your actual API endpoints
    const fetchData = async () => {
      setLoading(true);
      try {
        const [activityRes, chartRes, usersRes, typesRes] = await Promise.all([
          fetch("/api/activities"),
          fetch("/api/activity-trend"),
          fetch("/api/top-users"),
          fetch("/api/activity-types"),
        ]);

        const [activitiesData, chartData, topUsers, activityTypes] = await Promise.all([
          activityRes.json(),
          chartRes.json(),
          usersRes.json(),
          typesRes.json(),
        ]);

        setActivities(activitiesData || fallbackActivities);
        setChartData(chartData || fallbackChartData);
        setTopUsers(topUsers || fallbackTopUsers);
        setActivityTypes(activityTypes || fallbackActivityTypes);
      } catch (err) {
        console.error("Failed to fetch from backend. Using fallback data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const refreshData = async () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1200);
  };

  const filtered = activities.filter(
    (a) =>
      a.user.toLowerCase().includes(search.toLowerCase()) ||
      a.activity.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = () => {
    const headers = "User,Activity,Timestamp\n";
    const rows = activities
      .map((a) => `"${a.user}","${a.activity}","${a.timestamp}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "user_activity.csv";
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-3 rounded-lg shadow-lg">
              <Activity className="text-white w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-black">User Activity Dashboard</h1>
          </div>

          <button
            onClick={refreshData}
            className="flex items-center gap-2 bg-orange-500/20 text-orange-500 px-4 py-2 rounded-lg font-medium hover:bg-orange-500/30 transition-all duration-300 group"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
            Refresh Data
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64 bg-white rounded-xl shadow animate-pulse">
            <div className="text-gray-600 flex items-center gap-3">
              <RefreshCw className="w-5 h-5 animate-spin" />
              Loading activity data...
            </div>
          </div>
        ) : (
          <>
            {/* Chart Tabs */}
            <div className="bg-white rounded-xl shadow overflow-hidden mb-6 transition-all duration-300 hover:shadow-md">
              <div className="border-b border-gray-200">
                <div className="flex items-center">
                  <button
                    className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all ${activeTab === "line" ? "border-b-2 border-orange-500 text-orange-500" : "text-gray-500 hover:text-gray-700"}`}
                    onClick={() => setActiveTab("line")}
                  >
                    <LineChartIcon className="w-4 h-4" />
                    Activity Trend
                  </button>
                  <button
                    className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all ${activeTab === "bar" ? "border-b-2 border-orange-500 text-orange-500" : "text-gray-500 hover:text-gray-700"}`}
                    onClick={() => setActiveTab("bar")}
                  >
                    <BarChart3 className="w-4 h-4" />
                    Top Users
                  </button>
                  <button
                    className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all ${activeTab === "pie" ? "border-b-2 border-orange-500 text-orange-500" : "text-gray-500 hover:text-gray-700"}`}
                    onClick={() => setActiveTab("pie")}
                  >
                    <PieChartIcon className="w-4 h-4" />
                    Activity Types
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className={`transition-opacity duration-300 ${activeTab === "line" ? "opacity-100" : "opacity-0 hidden"}`}>
                  <h2 className="text-lg font-semibold mb-2">Activity Trend (Last 7 Days)</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <defs>
                        <linearGradient id="colorActions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF5733" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#FF5733" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          borderRadius: '8px',
                          border: 'none',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="actions"
                        stroke="#FF5733"
                        strokeWidth={3}
                        dot={{ stroke: '#FF5733', strokeWidth: 2, r: 4, fill: 'white' }}
                        activeDot={{ r: 6, stroke: '#FF5733', strokeWidth: 2, fill: '#FF5733' }}
                        animationDuration={1500}
                        fill="url(#colorActions)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className={`transition-opacity duration-300 ${activeTab === "bar" ? "opacity-100" : "opacity-0 hidden"}`}>
                  <h2 className="text-lg font-semibold mb-2">Top 5 Active Users</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topUsers} layout="vertical" margin={{ left: 50 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" stroke="#888" />
                      <YAxis dataKey="user" type="category" stroke="#888" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          borderRadius: '8px',
                          border: 'none',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar
                        dataKey="count"
                        fill="#FF5733"
                        animationDuration={1500}
                        animationBegin={300}
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className={`transition-opacity duration-300 ${activeTab === "pie" ? "opacity-100" : "opacity-0 hidden"}`}>
                  <h2 className="text-lg font-semibold mb-2">Activity Type Breakdown</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={activityTypes}
                        dataKey="count"
                        nameKey="type"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        animationDuration={1500}
                        animationBegin={300}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {activityTypes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          borderRadius: '8px',
                          border: 'none',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Search & Export */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between my-6 gap-4">
              <div className="relative w-full md:max-w-sm">
                <input
                  type="text"
                  placeholder="Search user or activity..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition-all duration-300"
                />
              </div>
              <button
                onClick={handleExport}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-500/80 text-white px-6 py-2.5 rounded-lg shadow-lg hover:shadow-xl hover:translate-y-0.5 transform transition-all duration-300 focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                <Download className="w-5 h-5" />
                Export CSV
              </button>
            </div>

            {/* Table */}
            <div className="overflow-hidden bg-white rounded-xl shadow transition-all duration-300 hover:shadow-md">
              <table className="min-w-full text-left">
                <thead className="bg-orange-500/10 text-orange-500/90">
                  <tr>
                    <th className="px-6 py-4 font-semibold">User</th>
                    <th className="px-6 py-4 font-semibold">Activity</th>
                    <th className="px-6 py-4 font-semibold">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((activity, index) => (
                    <tr
                      key={activity.id}
                      className="border-t hover:bg-gray-50 transition-colors duration-150"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4 flex items-center gap-2 text-black">
                        <div className="bg-orange-500/20 p-2 rounded-full">
                          <UserCircle2 className="w-5 h-5 text-orange-500" />
                        </div>
                        {activity.user}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{activity.activity}</td>
                      <td className="px-6 py-4 text-gray-500 text-sm">{activity.timestamp}</td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                        No activities found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {filtered.length > 0 && (
                <div className="px-6 py-3 bg-gray-50 border-t flex justify-between items-center text-sm text-gray-500">
                  <span>Showing {filtered.length} activities</span>
                  <div className="flex items-center gap-2">
                    <span className="text-orange-500">Page 1 of 1</span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserActivity;

