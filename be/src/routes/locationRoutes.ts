import { Router } from "express";
import * as locationController from "../controllers/locationController";

const router = Router();

router.post("/", locationController.createLocation);
router.get("/", locationController.getAllLocations);
router.get("/searchh", locationController.searchLocations);
router.get("/province/:province", locationController.getLocationsByProvince);
router.get("/:id", locationController.getLocationById);
router.put("/:id", locationController.updateLocation);
router.delete("/:id", locationController.deleteLocation);

export default router;

