import apiClient from '../configs/apiClient';

class UserService {
  /**
   * Update user profile (username and/or email)
   * @param {Object} updates - { username?, email? }
   * @returns {Promise<Object>} Updated user data
   */
  async updateProfile(updates) {
    try {
      const response = await apiClient.put('/auth/profile', updates);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  /**
   * Change user password
   * @param {Object} passwordData - { currentPassword, newPassword }
   * @returns {Promise<Object>} Success message
   */
  async changePassword(passwordData) {
    try {
      const response = await apiClient.put('/auth/change-password', passwordData);
      return response.data;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  /**
   * Get current user profile
   * @returns {Promise<Object>} User data
   */
  async getCurrentUser() {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }
}

export const userService = new UserService();
export default userService;
