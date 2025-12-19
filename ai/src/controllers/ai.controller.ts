import { Request, Response } from "express";
import AIService from "../services/aiService";
import { ChatRequestDto } from "../dtos/ChatRequestDto";
import { WeatherRequestDto } from "../dtos/WeatherRequestDto";
import { SessionIdParamDto } from "../dtos/SessionIdParamDto";

const aiService = new AIService();

export const chat = async (req: Request, res: Response) => {
  try {
    const dto = (req as any).dto as ChatRequestDto;

    // Process the query
    const result = await aiService.processQuery(
      dto.message,
      dto.sessionId || "default-session"
    );

    res.json(result);
  } catch (error) {
    console.error("Chat endpoint error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: errorMessage,
    });
  }
};

export const getContext = (req: Request, res: Response) => {
  try {
    const dto = (req as any).dto as SessionIdParamDto;
    const context = aiService.contextService.getContext(dto.sessionId);
    res.json({
      success: true,
      context,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
};

export const clearContext = (req: Request, res: Response) => {
  try {
    const dto = (req as any).dto as SessionIdParamDto;
    aiService.contextService.clearContext(dto.sessionId);
    res.json({
      success: true,
      message: "Context cleared",
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
};

export const getCurrentWeather = async (req: Request, res: Response) => {
  try {
    const dto = (req as any).dto as WeatherRequestDto;
    const weather = await aiService.weatherService.getCurrentWeather(dto.city);
    res.json({
      success: true,
      data: weather,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
};

