import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController';
import { verifyToken } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/admin.middleware';

const router = Router();
const dashboardController = new DashboardController();

// All dashboard routes require authentication and admin role
router.use(verifyToken);
router.use(requireAdmin);

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', dashboardController.getStats);

// GET /api/dashboard/recent-users - Get recent users
router.get('/recent-users', dashboardController.getRecentUsers);

// GET /api/dashboard/health - Get system health status
router.get('/health', dashboardController.getSystemHealth);

export default router;
