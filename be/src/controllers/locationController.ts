import { Request, Response } from "express";
import { locationService } from "../services/locationService";

export const createLocation = async (req: Request, res: Response) => {
  try {
    const location = await locationService.create(req.body);
    res.status(201).json({
      success: true,
      data: location,
    });
  } catch (error) {
    console.error("Create location error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
};

export const getAllLocations = async (req: Request, res: Response) => {
  try {
    const locations = await locationService.findAll();
    res.json({
      success: true,
      data: locations,
    });
  } catch (error) {
    console.error("Get all locations error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
};

export const getLocationById = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    if (!idParam) {
      return res.status(400).json({
        success: false,
        error: "Location ID is required",
      });
    }
    const id = parseInt(idParam, 10);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid location ID",
      });
    }
    const location = await locationService.findById(id);
    if (!location) {
      return res.status(404).json({
        success: false,
        error: "Location not found",
      });
    }
    res.json({
      success: true,
      data: location,
    });
  } catch (error) {
    console.error("Get location by id error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
};

export const updateLocation = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    if (!idParam) {
      return res.status(400).json({
        success: false,
        error: "Location ID is required",
      });
    }
    const id = parseInt(idParam, 10);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid location ID",
      });
    }
    const location = await locationService.update(id, req.body);
    if (!location) {
      return res.status(404).json({
        success: false,
        error: "Location not found",
      });
    }
    res.json({
      success: true,
      data: location,
    });
  } catch (error) {
    console.error("Update location error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
};

export const deleteLocation = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    if (!idParam) {
      return res.status(400).json({
        success: false,
        error: "Location ID is required",
      });
    }
    const id = parseInt(idParam, 10);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid location ID",
      });
    }
    const deleted = await locationService.delete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "Location not found",
      });
    }
    res.json({
      success: true,
      message: "Location deleted successfully",
    });
  } catch (error) {
    console.error("Delete location error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
};

export const searchLocations = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Search query is required",
      });
    }
    const locations = await locationService.search(query.trim());
    res.json({
      success: true,
      data: locations,
    });
  } catch (error) {
    console.error("Search locations error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
};

export const getLocationsByProvince = async (req: Request, res: Response) => {
  try {
    const province = req.params.province;
    if (!province) {
      return res.status(400).json({
        success: false,
        error: "Province parameter is required",
      });
    }
    const locations = await locationService.findByProvince(province);
    res.json({
      success: true,
      data: locations,
    });
  } catch (error) {
    console.error("Get locations by province error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
};

