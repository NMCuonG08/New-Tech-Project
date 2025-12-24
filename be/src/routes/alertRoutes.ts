import { Router } from "express";
import { alertController } from "../controllers/alertController";
import { verifyToken } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/admin.middleware";
import { validateDto } from "../middlewares/validation.middleware";
import { CreateAlertDto, UpdateAlertDto } from "../dtos/AlertDto";

const router = Router();

// All routes require authentication
router.use(verifyToken);

// POST /api/alerts - Create a new alert
router.post("/", validateDto(CreateAlertDto), alertController.createAlert.bind(alertController));

// GET /api/alerts - Get all user's alerts
router.get("/", alertController.getUserAlerts.bind(alertController));

// GET /api/alerts/:id - Get alert by id
router.get("/:id", alertController.getAlertById.bind(alertController));

// GET /api/alerts/location/:locationId - Get active alerts by location
router.get("/location/:locationId", alertController.getActiveAlertsByLocation.bind(alertController));

// PUT /api/alerts/:id - Update an alert
router.put("/:id", validateDto(UpdateAlertDto), alertController.updateAlert.bind(alertController));

// DELETE /api/alerts/:id - Delete an alert
router.delete("/:id", alertController.deleteAlert.bind(alertController));

// GET /api/alerts/system/active - Get active system alerts (for all authenticated users)
router.get("/system/active", alertController.getActiveSystemAlerts.bind(alertController));

// ============ ADMIN ROUTES ============
// POST /api/alerts/system/broadcast - Broadcast system alert (Admin only)
router.post("/system/broadcast", verifyToken, requireAdmin, alertController.broadcastSystemAlert.bind(alertController));

// GET /api/alerts/system/all - Get all system alerts (Admin only)
router.get("/system/all", verifyToken, requireAdmin, alertController.getSystemAlerts.bind(alertController));

// DELETE /api/alerts/system/:id - Delete system alert (Admin only)
router.delete("/system/:id", verifyToken, requireAdmin, alertController.deleteSystemAlert.bind(alertController));

export default router;
