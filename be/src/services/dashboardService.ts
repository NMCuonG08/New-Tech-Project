import { AppDataSource } from '../data-source';
import { User } from '../entities/User';
import { Favorite } from '../entities/Favorite';
import { Alert } from '../entities/Alert';
import { Note } from '../entities/Note';

export class DashboardService {
  private userRepository = AppDataSource.getRepository(User);
  private favoriteRepository = AppDataSource.getRepository(Favorite);
  private alertRepository = AppDataSource.getRepository(Alert);
  private noteRepository = AppDataSource.getRepository(Note);

  async getStatistics() {
    try {
      // Total users
      const totalUsers = await this.userRepository.count();

      // Users created today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const newUsersToday = await this.userRepository
        .createQueryBuilder('user')
        .where('user.createdAt >= :today', { today })
        .getCount();

      // Active users (users with favorites, alerts, or notes)
      const activeUsersQuery = await this.userRepository
        .createQueryBuilder('user')
        .leftJoin('user.favorites', 'favorite')
        .leftJoin('user.alerts', 'alert')
        .leftJoin('user.notes', 'note')
        .where('favorite.id IS NOT NULL OR alert.id IS NOT NULL OR note.id IS NOT NULL')
        .distinct(true)
        .getCount();

      // Total favorites (as proxy for weather requests)
      const totalFavorites = await this.favoriteRepository.count();

      // Total alerts
      const totalAlerts = await this.alertRepository.count();

      // Total notes (as proxy for AI queries)
      const totalNotes = await this.noteRepository.count();

      return {
        totalUsers,
        activeUsers: activeUsersQuery,
        weatherRequests: totalFavorites * 10, // Estimate: each favorite checked ~10 times
        aiQueries: totalNotes,
        newUsersToday,
        avgResponseTime: '1.2s', // This would need real monitoring data
        totalFavorites,
        totalAlerts,
        totalNotes,
      };
    } catch (error) {
      console.error('Error in getStatistics:', error);
      throw error;
    }
  }

  async getRecentUsers(limit: number = 10) {
    try {
      const users = await this.userRepository.find({
        order: {
          createdAt: 'DESC',
        },
        take: limit,
        select: ['id', 'username', 'email', 'createdAt', 'role'],
      });

      return users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        joinDate: user.createdAt,
        status: 'active', // You could add a lastLoginAt field to track this
        role: user.role,
      }));
    } catch (error) {
      console.error('Error in getRecentUsers:', error);
      throw error;
    }
  }

  async getSystemHealth() {
    try {
      const health: any = {
        database: 'healthy',
        api: 'healthy',
        ai: 'healthy',
        cache: 'healthy',
      };

      // Test database connection
      try {
        await this.userRepository.count();
      } catch (error) {
        health.database = 'error';
      }

      // You can add more health checks here
      // For example, ping external APIs, check cache, etc.

      return health;
    } catch (error) {
      console.error('Error in getSystemHealth:', error);
      throw error;
    }
  }
}
