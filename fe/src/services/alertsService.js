import apiClient from '../configs/apiClient';

// Alert Types
export const AlertType = {
  TEMPERATURE_HIGH: 'temperature_high',
  TEMPERATURE_LOW: 'temperature_low',
  RAIN: 'rain',
  WIND: 'wind',
  AQI: 'aqi',
  HUMIDITY: 'humidity'
};

// Alerts API Service
export const alertsService = {
  // Get all user alerts
  async getAlerts() {
    const response = await apiClient.get('/alerts');
    return response.data;
  },

  // Get alert by ID
  async getAlertById(id) {
    const response = await apiClient.get(`/alerts/${id}`);
    return response.data;
  },

  // Get active alerts by location
  async getActiveAlertsByLocation(locationId) {
    const response = await apiClient.get(`/alerts/location/${locationId}`);
    return response.data;
  },

  // Create a new alert
  async createAlert(alertData) {
    const response = await apiClient.post('/alerts', alertData);
    return response.data;
  },

  // Update an alert
  async updateAlert(id, updates) {
    const response = await apiClient.put(`/alerts/${id}`, updates);
    return response.data;
  },

  // Delete an alert
  async deleteAlert(id) {
    await apiClient.delete(`/alerts/${id}`);
  },

  // Check alerts for a location
  async checkAlertsForLocation(locationId) {
    const response = await apiClient.post(`/alerts/check/${locationId}`);
    return response.data;
  }
};

export default alertsService;
