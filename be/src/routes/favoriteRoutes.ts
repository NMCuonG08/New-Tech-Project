import { Router } from "express";
import { favoriteController } from "../controllers/favoriteController";
import { verifyToken } from "../middlewares/auth.middleware";
import { validateDto } from "../middlewares/validation.middleware";
import { CreateFavoriteDto } from "../dtos/FavoriteDto";

const router = Router();

// All routes require authentication
router.use(verifyToken);

// POST /api/favorites - Create a new favorite
router.post("/", validateDto(CreateFavoriteDto), favoriteController.createFavorite.bind(favoriteController));

// GET /api/favorites - Get all user's favorites
router.get("/", favoriteController.getUserFavorites.bind(favoriteController));

// GET /api/favorites/check/:locationId - Check if location is favorite
router.get("/check/:locationId", favoriteController.checkFavorite.bind(favoriteController));

// DELETE /api/favorites/:id - Delete a favorite
router.delete("/:id", favoriteController.deleteFavorite.bind(favoriteController));

export default router;
