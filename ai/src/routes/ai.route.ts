import { Router } from "express";
import { validateDto } from "../middlewares/validation.middleware";
import { ChatRequestDto } from "../dtos/ChatRequestDto";
import { WeatherRequestDto } from "../dtos/WeatherRequestDto";
import { SessionIdParamDto } from "../dtos/SessionIdParamDto";
import * as aiController from "../controllers/ai.controller";

const router = Router();

// Chat endpoint
router.post("/chat", validateDto(ChatRequestDto, "body"), aiController.chat);

// Context endpoints
router.get(
  "/context/:sessionId",
  validateDto(SessionIdParamDto, "params"),
  aiController.getContext
);

router.delete(
  "/context/:sessionId",
  validateDto(SessionIdParamDto, "params"),
  aiController.clearContext
);

// Weather endpoint
router.post(
  "/weather/current",
  validateDto(WeatherRequestDto, "body"),
  aiController.getCurrentWeather
);

export default router;

