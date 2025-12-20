import { useState, useEffect } from 'react';
import { getDashboardStats, getRecentUsers, getSystemHealth } from '../services/dashboardService';

export function useDashboard() {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, usersData, healthData] = await Promise.all([
        getDashboardStats(),
        getRecentUsers(5),
        getSystemHealth(),
      ]);

      setStats(statsData);
      setRecentUsers(usersData);
      setSystemHealth(healthData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const refresh = () => {
    fetchDashboardData();
  };

  return {
    stats,
    recentUsers,
    systemHealth,
    loading,
    error,
    refresh,
  };
}
