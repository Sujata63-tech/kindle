import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  PenTool, 
  MessageCircle, 
  ShoppingBag, 
  TrendingUp,
  Clock,
  Users,
  Activity
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Function to refresh dashboard data
  const refreshDashboard = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Fetch dashboard data when component mounts or when refreshKey changes
  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const [statsResponse, activityResponse] = await Promise.all([
          api.dashboard.getStats(),
          api.dashboard.getActivity({ limit: 10 })
        ]);
        
        if (isMounted) {
          setStats(statsResponse.data.stats);
          setRecentActivity(activityResponse.data.activities);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, refreshKey]);

  // Listen for custom events from other components
  useEffect(() => {
    const handleDataUpdate = () => {
      setRefreshKey(prev => prev + 1);
    };

    // Add event listener with proper cleanup
    window.addEventListener('dashboard:refresh', handleDataUpdate);
    
    // Initial data fetch
    refreshDashboard();
    
    return () => {
      window.removeEventListener('dashboard:refresh', handleDataUpdate);
    };
  }, [isAuthenticated]);

  const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
    <div className="card-dreamy p-6 hover:shadow-elegant transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-beige-600">{title}</p>
          <p className="text-3xl font-bold text-beige-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-beige-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      {trend && (
        <div className="flex items-center mt-4 text-sm">
          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
          <span className="text-green-600">{trend}</span>
        </div>
      )}
    </div>
  );

  const ActivityItem = ({ activity }) => {
    const getActivityIcon = (type) => {
      switch (type) {
        case 'todo':
          return CheckSquare;
        case 'poetry':
          return PenTool;
        case 'order':
          return ShoppingBag;
        default:
          return Activity;
      }
    };

    const getActivityColor = (type) => {
      switch (type) {
        case 'todo':
          return 'text-blue-600 bg-blue-100';
        case 'poetry':
          return 'text-purple-600 bg-purple-100';
        case 'order':
          return 'text-green-600 bg-green-100';
        default:
          return 'text-beige-600 bg-beige-100';
      }
    };

    const Icon = getActivityIcon(activity.type);
    const colorClass = getActivityColor(activity.type);

    return (
      <div className="flex items-start space-x-3 p-3 hover:bg-beige-50 rounded-lg transition-colors">
        <div className={`p-2 rounded-lg ${colorClass}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-beige-900">
            {activity.action} {activity.title}
          </p>
          <p className="text-xs text-beige-500">
            {new Date(activity.timestamp).toLocaleDateString()} at{' '}
            {new Date(activity.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </div>
    );
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rosegold-500"></div>
      </div>
    );
  }

  // Show message when not authenticated
  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-beige-700">Please log in to view your dashboard</h2>
        <p className="text-beige-500 mt-2">You need to be logged in to see your personalized dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Welcome Header */}
      <div className="card-dreamy p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-beige-900">
              Welcome back, {user?.username}! 🌟
            </h1>
            <p className="text-beige-600 mt-1">
              Here's what's happening in your digital library today
            </p>
          </div>
          <div className="hidden sm:block">
            <div className="text-right">
              <p className="text-sm text-beige-500">Today</p>
              <p className="text-lg font-semibold text-beige-900">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Tasks"
            value={stats.todos?.total || 0}
            subtitle={`${stats.todos?.completed || 0} completed`}
            icon={CheckSquare}
            color="bg-gradient-to-r from-blue-500 to-blue-600"
            trend={stats.todos?.completionRate ? `${stats.todos.completionRate}% completion rate` : null}
          />
          <StatCard
            title="Poetry Collection"
            value={stats.poetry?.total || 0}
            subtitle="Poems uploaded"
            icon={PenTool}
            color="bg-gradient-to-r from-purple-500 to-purple-600"
          />
          <StatCard
            title="Unread Messages"
            value={stats.chat?.unreadMessages || 0}
            subtitle={`${stats.chat?.totalConversations || 0} conversations`}
            icon={MessageCircle}
            color="bg-gradient-to-r from-rosegold-500 to-rosegold-600"
          />
          <StatCard
            title="Orders"
            value={stats.orders?.total || 0}
            subtitle={`${stats.orders?.recent || 0} this month`}
            icon={ShoppingBag}
            color="bg-gradient-to-r from-green-500 to-green-600"
          />
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="card-dreamy p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-beige-900">Recent Activity</h2>
              <Clock className="w-5 h-5 text-beige-500" />
            </div>
            
            {recentActivity.length > 0 ? (
              <div className="space-y-2">
                {recentActivity.map((activity, index) => (
                  <ActivityItem key={index} activity={activity} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-beige-300 mx-auto mb-3" />
                <p className="text-beige-500">No recent activity</p>
                <p className="text-sm text-beige-400">Start using the app to see your activity here</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="card-dreamy p-6">
            <h3 className="text-lg font-semibold text-beige-900 mb-4">Quick Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-beige-600">Pending Tasks</span>
                <span className="font-semibold text-beige-900">
                  {stats?.todos?.pending || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-beige-600">Total Poems</span>
                <span className="font-semibold text-beige-900">
                  {stats?.poetry?.total || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-beige-600">Active Chats</span>
                <span className="font-semibold text-beige-900">
                  {stats?.chat?.totalConversations || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-beige-600">Total Orders</span>
                <span className="font-semibold text-beige-900">
                  {stats?.orders?.total || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Today's Goals */}
          <div className="card-dreamy p-6">
            <h3 className="text-lg font-semibold text-beige-900 mb-4">Today's Goals</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-rosegold-500 rounded-full"></div>
                <span className="text-sm text-beige-700">Complete 3 pending tasks</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-beige-400 rounded-full"></div>
                <span className="text-sm text-beige-700">Read new poetry submissions</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-beige-400 rounded-full"></div>
                <span className="text-sm text-beige-700">Reply to messages</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
