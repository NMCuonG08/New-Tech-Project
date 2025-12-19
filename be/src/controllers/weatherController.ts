import { Request, Response } from "express";
import { weatherService } from "../services/weatherService";

export const getCurrentWeather = async (req: Request, res: Response) => {
  try {
    const { city, units } = req.body;
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

