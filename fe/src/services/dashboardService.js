import apiClient from '../configs/apiClient';

export const getDashboardStats = async () => {
  const response = await apiClient.get('/dashboard/stats');
  return response.data;
};

export const getRecentUsers = async (limit = 10) => {
  const response = await apiClient.get('/dashboard/recent-users', {
    params: { limit }
  });
  return response.data;
};

export const getSystemHealth = async () => {
  const response = await apiClient.get('/dashboard/health');
  return response.data;
};
