import { useState, useEffect } from 'react';
import { getDashboardStats, getRecentUsers, getSystemHealth, getTotalCities } from '../services/dashboardService';

export function useDashboard() {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [totalCities, setTotalCities] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, usersData, healthData, citiesData] = await Promise.all([
        getDashboardStats(),
        getRecentUsers(5),
        getSystemHealth(),
        getTotalCities(),
      ]);

      setStats(statsData);
      setRecentUsers(usersData);
      setSystemHealth(healthData);
      setTotalCities(citiesData.totalCities);
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
    totalCities,
    loading,
    error,
    refresh,
  };
}
