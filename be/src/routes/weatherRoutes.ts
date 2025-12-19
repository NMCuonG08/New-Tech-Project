import { Router } from "express";
import * as weatherController from "../controllers/weatherController";

const router = Router();

router.post("/current", weatherController.getCurrentWeather);
router.post("/forecast", weatherController.getForecast);
router.post("/coords", weatherController.getWeatherByCoords);

export default router;

