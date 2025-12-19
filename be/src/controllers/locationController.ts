import { Request, Response } from "express";
import { locationService } from "../services/locationService";
import { uploadBase64Image, uploadMultipleImages, deleteImage } from "../utils/cloudinaryService";

export const createLocation = async (req: Request, res: Response) => {
  try {
    const { images: base64Images, ...locationData } = req.body;
    
    // Upload images if provided
    let imageUrls: string[] = [];
    if (base64Images && Array.isArray(base64Images) && base64Images.length > 0) {
      const uploadResults = await uploadMultipleImages(base64Images, "locations");
      imageUrls = uploadResults.map((r) => r.url);
    }
    
    const location = await locationService.create({
      ...locationData,
      images: imageUrls.length > 0 ? imageUrls : undefined,
    });
    
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
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    // If no pagination params, return all
    if (!req.query.page && !req.query.limit) {
      const locations = await locationService.findAll();
      return res.json({
        success: true,
        data: locations,
      });
    }
    
    // Return paginated results
    const result = await locationService.findAllPaginated(page, limit);
    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
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
    
    const { images: base64Images, ...locationData } = req.body;
    
    // Upload new images if provided
    let updateData = { ...locationData };
    if (base64Images && Array.isArray(base64Images) && base64Images.length > 0) {
      const uploadResults = await uploadMultipleImages(base64Images, "locations");
      const imageUrls = uploadResults.map((r) => r.url);
      updateData.images = imageUrls;
    }
    
    const location = await locationService.update(id, updateData);
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

