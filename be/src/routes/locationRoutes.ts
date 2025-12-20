import { Router } from "express";
import * as locationController from "../controllers/locationController";
import { verifyToken } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/admin.middleware";

const router = Router();

// Admin only routes
router.post("/", verifyToken, requireAdmin, locationController.createLocation);
router.put("/:id", verifyToken, requireAdmin, locationController.updateLocation);
router.delete("/:id", verifyToken, requireAdmin, locationController.deleteLocation);

// Public routes
router.get("/", locationController.getAllLocations);
router.get("/search", locationController.searchLocations);
router.get("/province/:province", locationController.getLocationsByProvince);
router.get("/:id", locationController.getLocationById);

export default router;

