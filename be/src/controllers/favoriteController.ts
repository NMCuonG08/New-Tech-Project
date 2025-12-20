import { Request, Response } from "express";
import { favoriteService } from "../services/favoriteService";

export class FavoriteController {
  async createFavorite(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { locationId } = req.body;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const favorite = await favoriteService.createFavorite(userId, locationId);
      res.status(201).json(favorite);
    } catch (error: any) {
      if (error.message === "Location already in favorites") {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  }

  async getUserFavorites(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const favorites = await favoriteService.getUserFavorites(userId);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async deleteFavorite(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      await favoriteService.deleteFavorite(Number(id), userId);
      res.status(204).send();
    } catch (error: any) {
      if (error.message === "Favorite not found") {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  }

  async checkFavorite(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { locationId } = req.params;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const isFavorite = await favoriteService.isFavorite(userId, Number(locationId));
      res.json({ isFavorite });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export const favoriteController = new FavoriteController();
