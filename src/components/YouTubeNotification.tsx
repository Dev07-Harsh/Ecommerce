import React, { useState, useEffect } from 'react';
import { AlertTriangle, Youtube, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface YouTubeStatus {
  status: 'no_token' | 'expired' | 'expiring_soon' | 'active' | 'error';
  message: string;
  token_info?: {
    days_until_expiry: number;
  };
}

interface NotificationProps {
  showIcon?: boolean;
  compact?: boolean;
}

const YouTubeNotification: React.FC<NotificationProps> = ({ 
  showIcon = true, 
  compact = false 
}) => {
  const { accessToken, user } = useAuth();
  const [status, setStatus] = useState<YouTubeStatus | null>(null);
  const [loading, setLoading] = useState(true);

  // Only show for super admin
  if (user?.role !== 'admin') {
    return null;
  }

  useEffect(() => {
    const checkYouTubeStatus = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/superadmin/youtube/status', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStatus(data.data.youtube_integration);
        }
      } catch (error) {
        console.error('Error checking YouTube status:', error);
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      checkYouTubeStatus();
      
      // Check status every 5 minutes
      const interval = setInterval(checkYouTubeStatus, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [accessToken]);

  if (loading || !status) {
    return null;
  }

  // Don't show notification if YouTube is active and not expiring soon
  if (status.status === 'active' && (!status.token_info || status.token_info.days_until_expiry > 7)) {
    return null;
  }

  const getNotificationConfig = () => {
    switch (status.status) {
      case 'no_token':
        return {
          color: 'bg-yellow-100 border-yellow-200 text-yellow-800',
          icon: AlertTriangle,
          iconColor: 'text-yellow-600',
          title: 'YouTube Not Configured',
          message: 'YouTube Live integration is not set up',
          severity: 'medium' as const
        };
      case 'expired':
        return {
          color: 'bg-red-100 border-red-200 text-red-800',
          icon: AlertTriangle,
          iconColor: 'text-red-600',
          title: 'YouTube Token Expired',
          message: 'YouTube integration is disabled',
          severity: 'high' as const
        };
      case 'expiring_soon':
        return {
          color: 'bg-orange-100 border-orange-200 text-orange-800',
          icon: Clock,
          iconColor: 'text-orange-600',
          title: 'YouTube Token Expiring Soon',
          message: `Expires in ${status.token_info?.days_until_expiry || 0} days`,
          severity: 'medium' as const
        };
      default:
        return null;
    }
  };

  const config = getNotificationConfig();
  if (!config) return null;

  const Icon = config.icon;

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${config.color}`}>
        {showIcon && <Icon className={`h-4 w-4 ${config.iconColor}`} />}
        <span className="text-sm font-medium">{config.title}</span>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-lg border ${config.color}`}>
      <div className="flex items-start space-x-3">
        {showIcon && (
          <div className="flex items-center space-x-2">
            <Youtube className="h-5 w-5 text-red-600" />
            <Icon className={`h-5 w-5 ${config.iconColor}`} />
          </div>
        )}
        <div className="flex-1">
          <h4 className="font-medium">{config.title}</h4>
          <p className="text-sm opacity-90 mt-1">{config.message}</p>
          {config.severity === 'high' && (
            <div className="mt-2">
              <a 
                href="/superadmin/youtube-integration"
                className="inline-flex items-center text-sm font-medium hover:underline"
              >
                Configure Now →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default YouTubeNotification;
