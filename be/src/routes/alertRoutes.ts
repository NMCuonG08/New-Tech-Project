import { Router } from "express";
import { alertController } from "../controllers/alertController";
import { verifyToken } from "../middlewares/auth.middleware";
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

// POST /api/alerts/check/:locationId - Check alerts for a location
router.post("/check/:locationId", alertController.checkAlertsForLocation.bind(alertController));

// PUT /api/alerts/:id - Update an alert
router.put("/:id", validateDto(UpdateAlertDto), alertController.updateAlert.bind(alertController));

// DELETE /api/alerts/:id - Delete an alert
router.delete("/:id", alertController.deleteAlert.bind(alertController));

export default router;
