import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboardService';

export class DashboardController {
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
  }

  getStats = async (req: Request, res: Response) => {
    try {
      const stats = await this.dashboardService.getStatistics();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ message: 'Failed to fetch dashboard statistics' });
    }
  };

  getRecentUsers = async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const users = await this.dashboardService.getRecentUsers(limit);
      res.json(users);
    } catch (error) {
      console.error('Error fetching recent users:', error);
      res.status(500).json({ message: 'Failed to fetch recent users' });
    }
  };

  getSystemHealth = async (req: Request, res: Response) => {
    try {
      const health = await this.dashboardService.getSystemHealth();
      res.json(health);
    } catch (error) {
      console.error('Error fetching system health:', error);
      res.status(500).json({ message: 'Failed to fetch system health' });
    }
  };
}
