import { Request, Response } from "express";
import { weatherService } from "../services/weatherService";

export const getCurrentWeather = async (req: Request, res: Response) => {
  try {
    const { city, units } = req.body;
    console.log('[Backend getCurrentWeather] Received city:', city, 'units:', units);
    if (!city) {
      return res.status(400).json({
        success: false,
        error: "City is required",
      });
    }
    const weather = await weatherService.getCurrentWeather(city, units || "metric");
    res.json({
      success: true,
      data: weather,
    });
  } catch (error) {
    console.error("Get current weather error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
};

export const getForecast = async (req: Request, res: Response) => {
  try {
    const { city, units } = req.body;
    console.log('[Backend getForecast] Received city:', city, 'units:', units);
    if (!city) {
      return res.status(400).json({
        success: false,
        error: "City is required",
      });
    }
    const forecast = await weatherService.getForecast(city, units || "metric");
    res.json({
      success: true,
      data: forecast,
    });
  } catch (error) {
    console.error("Get forecast error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
};

export const getWeatherByCoords = async (req: Request, res: Response) => {
  try {
    const { lat, lon, units } = req.body;
    if (typeof lat !== "number" || typeof lon !== "number") {
      return res.status(400).json({
        success: false,
        error: "Latitude and longitude are required and must be numbers",
      });
    }
    const weather = await weatherService.getWeatherByCoords(lat, lon, units || "metric");
    res.json({
      success: true,
      data: weather,
    });
  } catch (error) {
    console.error("Get weather by coords error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
};

export const getHourlyForecast = async (req: Request, res: Response) => {
  try {
    const { city, units, page = 1, limit = 24, sortOrder = 'asc' } = req.body;
    console.log('[Backend getHourlyForecast] Received:', { city, units, page, limit, sortOrder });
    
    if (!city) {
      return res.status(400).json({
        success: false,
        error: "City is required",
      });
    }
    
    const forecast = await weatherService.getHourlyForecast(city, units || "metric", {
      page: Number(page),
      limit: Number(limit),
      sortOrder: sortOrder as 'asc' | 'desc',
    });
    
    res.json({
      success: true,
      data: forecast,
    });
  } catch (error) {
    console.error("Get hourly forecast error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
};

export const getDailyForecast = async (req: Request, res: Response) => {
  try {
    const { city, units, page = 1, limit = 7, sortOrder = 'asc' } = req.body;
    console.log('[Backend getDailyForecast] Received:', { city, units, page, limit, sortOrder });
    
    if (!city) {
      return res.status(400).json({
        success: false,
        error: "City is required",
      });
    }
    
    const forecast = await weatherService.getDailyForecast(city, units || "metric", {
      page: Number(page),
      limit: Number(limit),
      sortOrder: sortOrder as 'asc' | 'desc',
    });
    
    res.json({
      success: true,
      data: forecast,
    });
  } catch (error) {
    console.error("Get daily forecast error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
};

