import React, { useState, useEffect } from 'react';
import { 
  Youtube, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  ExternalLink,
  Settings,
  Calendar,
  TrendingUp,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface YouTubeTokenInfo {
  id: number;
  token_type: string;
  expires_at: string;
  created_by: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  days_until_expiry: number;
}

interface YouTubeStatus {
  status: 'no_token' | 'expired' | 'expiring_soon' | 'active' | 'error';
  message: string;
  token_info?: YouTubeTokenInfo;
}

interface YouTubeStats {
  total_streams_with_youtube: number;
  total_streams_without_youtube: number;
  recent_streams_with_youtube: number;
  integration_success_rate: number;
  last_updated: string;
}

interface Notification {
  type: 'warning' | 'error' | 'success' | 'info';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

interface ActionRequired {
  action: string;
  title: string;
  description: string;
}

interface DashboardData {
  youtube_integration: YouTubeStatus;
  notifications: Notification[];
  actions_required: ActionRequired[];
}

const YouTubeManagement: React.FC = () => {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [stats, setStats] = useState<YouTubeStats | null>(null);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // API call helper
  const apiCall = async (url: string, options: RequestInit = {}) => {
    const response = await fetch(`http://localhost:5001${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }
    
    return response.json();
  };

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      const data = await apiCall('/api/superadmin/youtube/status');
      setDashboardData(data.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  // Load statistics
  const loadStats = async () => {
    try {
      const data = await apiCall('/api/superadmin/youtube/stats');
      setStats(data.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadDashboardData(), loadStats()]);
      setLoading(false);
    };
    
    loadData();
  }, []);

  // Configure YouTube integration
  const handleConfigure = async () => {
    setIsConfiguring(true);
    try {
      const response = await apiCall('/api/superadmin/youtube/configure', {
        method: 'POST',
        body: JSON.stringify({
          frontend_url: window.location.origin
        })
      });
      
      // Open OAuth URL in new window
      window.open(response.data.oauth_url, 'youtube-oauth', 'width=600,height=700,scrollbars=yes');
      
      // Poll for completion
      const pollForCompletion = setInterval(async () => {
        try {
          await loadDashboardData();
          if (dashboardData?.youtube_integration.status === 'active') {
            clearInterval(pollForCompletion);
            setIsConfiguring(false);
          }
        } catch (error) {
          console.error('Polling error:', error);
        }
      }, 3000);
      
      // Stop polling after 5 minutes
      setTimeout(() => {
        clearInterval(pollForCompletion);
        setIsConfiguring(false);
      }, 300000);
      
    } catch (error) {
      console.error('Error configuring YouTube:', error);
      setIsConfiguring(false);
    }
  };

  // Refresh token
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await apiCall('/api/live-streams/admin/youtube/token/refresh', {
        method: 'POST'
      });
      await loadDashboardData();
    } catch (error) {
      console.error('Error refreshing token:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Revoke token
  const handleRevoke = async () => {
    if (!confirm('Are you sure you want to revoke the YouTube token? This will disable YouTube integration.')) {
      return;
    }
    
    setIsRevoking(true);
    try {
      await apiCall('/api/live-streams/admin/youtube/token/revoke', {
        method: 'DELETE'
      });
      await loadDashboardData();
    } catch (error) {
      console.error('Error revoking token:', error);
    } finally {
      setIsRevoking(false);
    }
  };

  // Test connection
  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await apiCall('/api/superadmin/youtube/test-connection', {
        method: 'POST'
      });
      setTestResult(result.data);
    } catch (error) {
      console.error('Error testing connection:', error);
      setTestResult({ 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Get status color and icon
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'active':
        return { color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle };
      case 'expiring_soon':
        return { color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: AlertTriangle };
      case 'expired':
      case 'no_token':
        return { color: 'text-red-600', bgColor: 'bg-red-100', icon: XCircle };
      default:
        return { color: 'text-gray-600', bgColor: 'bg-gray-100', icon: AlertCircle };
    }
  };

  const getNotificationColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-200 bg-red-50 text-red-800';
      case 'medium': return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      default: return 'border-blue-200 bg-blue-50 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-lg font-medium text-gray-700">Loading YouTube Integration...</span>
        </div>
      </div>
    );
  }

  const statusDisplay = dashboardData ? getStatusDisplay(dashboardData.youtube_integration.status) : null;
  const StatusIcon = statusDisplay?.icon || AlertCircle;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Youtube className="h-8 w-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">YouTube Integration</h1>
          </div>
          <p className="text-gray-600">
            Manage YouTube Live streaming integration for merchant live streams
          </p>
        </div>

        {/* Status Overview */}
        {dashboardData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Current Status */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Integration Status</h3>
                <div className={`p-2 rounded-full ${statusDisplay?.bgColor}`}>
                  <StatusIcon className={`h-6 w-6 ${statusDisplay?.color}`} />
                </div>
              </div>
              <p className={`text-sm ${statusDisplay?.color} font-medium mb-2`}>
                {dashboardData.youtube_integration.status.replace('_', ' ').toUpperCase()}
              </p>
              <p className="text-gray-600 text-sm">
                {dashboardData.youtube_integration.message}
              </p>
              
              {dashboardData.youtube_integration.token_info && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Expires in:</span>
                      <span className="ml-2 font-medium">
                        {dashboardData.youtube_integration.token_info.days_until_expiry} days
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Token Type:</span>
                      <span className="ml-2 font-medium">
                        {dashboardData.youtube_integration.token_info.token_type}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            {stats && (
              <>
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Success Rate</h3>
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {stats.integration_success_rate}%
                  </div>
                  <p className="text-gray-600 text-sm">
                    YouTube integration success rate
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {stats.recent_streams_with_youtube}
                  </div>
                  <p className="text-gray-600 text-sm">
                    YouTube streams in last 30 days
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Notifications */}
        {dashboardData?.notifications && dashboardData.notifications.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Notifications</h2>
            <div className="space-y-3">
              {dashboardData.notifications.map((notification, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getNotificationColor(notification.severity)}`}
                >
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 mt-0.5" />
                    <div>
                      <h4 className="font-medium">{notification.title}</h4>
                      <p className="text-sm opacity-90">{notification.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(!dashboardData?.youtube_integration.token_info || 
              dashboardData.youtube_integration.status === 'expired' ||
              dashboardData.youtube_integration.status === 'no_token') && (
              <button
                onClick={handleConfigure}
                disabled={isConfiguring}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isConfiguring ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Settings className="h-4 w-4" />
                )}
                <span>Configure YouTube</span>
              </button>
            )}

            {dashboardData?.youtube_integration.token_info && (
              <>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isRefreshing ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  <span>Refresh Token</span>
                </button>

                <button
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isTesting ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <ExternalLink className="h-4 w-4" />
                  )}
                  <span>Test Connection</span>
                </button>

                <button
                  onClick={handleRevoke}
                  disabled={isRevoking}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isRevoking ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  <span>Revoke Access</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Test Results */}
        {testResult && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Connection Test Results</h2>
            {testResult.status === 'connected' ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">Connection Successful</span>
                </div>
                {testResult.channel_info && (
                  <div className="space-y-2 text-sm text-green-700">
                    <p><strong>Channel:</strong> {testResult.channel_info.channel_name}</p>
                    <p><strong>Subscribers:</strong> {testResult.channel_info.subscriber_count}</p>
                    <p><strong>Total Videos:</strong> {testResult.channel_info.video_count}</p>
                    <p><strong>Total Views:</strong> {testResult.channel_info.view_count}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-red-800">Connection Failed</span>
                </div>
                <p className="text-sm text-red-700">{testResult.message}</p>
              </div>
            )}
          </div>
        )}

        {/* Statistics Details */}
        {stats && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Usage Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {stats.total_streams_with_youtube}
                </div>
                <p className="text-gray-600 text-sm">Total YouTube Streams</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-600 mb-2">
                  {stats.total_streams_without_youtube}
                </div>
                <p className="text-gray-600 text-sm">Regular Streams</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {stats.recent_streams_with_youtube}
                </div>
                <p className="text-gray-600 text-sm">Recent YouTube Streams</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {stats.integration_success_rate}%
                </div>
                <p className="text-gray-600 text-sm">Success Rate</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Last updated: {new Date(stats.last_updated).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default YouTubeManagement;
