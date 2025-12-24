import apiClient from '../configs/apiClient';

class AlertService {
    // Get user alerts
    async getUserAlerts() {
        try {
            const response = await apiClient.get('/alerts');
            return response.data.data || [];
        } catch (error) {
            console.error('Get user alerts error:', error);
            throw error;
        }
    }

    // Create alert
    async createAlert(alertData) {
        try {
            const response = await apiClient.post('/alerts', alertData);
            return response.data.data;
        } catch (error) {
            console.error('Create alert error:', error);
            throw error;
        }
    }

    // Update alert
    async updateAlert(id, alertData) {
        try {
            const response = await apiClient.put(`/alerts/${id}`, alertData);
            return response.data.data;
        } catch (error) {
            console.error('Update alert error:', error);
            throw error;
        }
    }

    // Delete alert
    async deleteAlert(id) {
        try {
            await apiClient.delete(`/alerts/${id}`);
        } catch (error) {
            console.error('Delete alert error:', error);
            throw error;
        }
    }

    // Get system alerts (admin)
    async getSystemAlerts() {
        try {
            const response = await apiClient.get('/alerts/system/all');
            return response.data.data || [];
        } catch (error) {
            console.error('Get system alerts error:', error);
            throw error;
        }
    }

    // Get active system alerts (for all users)
    async getActiveSystemAlerts() {
        try {
            const response = await apiClient.get('/alerts/system/active');
            return response.data.data || [];
        } catch (error) {
            console.error('Get active system alerts error:', error);
            throw error;
        }
    }

    // Broadcast system alert (admin)
    async broadcastSystemAlert(alertData) {
        try {
            const response = await apiClient.post('/alerts/system/broadcast', alertData);
            return response.data.data;
        } catch (error) {
            console.error('Broadcast alert error:', error);
            throw error;
        }
    }

    // Delete system alert (admin)
    async deleteSystemAlert(id) {
        try {
            await apiClient.delete(`/alerts/system/${id}`);
        } catch (error) {
            console.error('Delete system alert error:', error);
            throw error;
        }
    }
}

export const alertService = new AlertService();
