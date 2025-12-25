import { favoriteRepository } from "../repositories/FavoriteRepository";
import { Favorite } from "../entities/Favorite";

export class FavoriteService {
  async createFavorite(userId: number, locationId: number): Promise<Favorite> {
    const existing = await favoriteRepository.findOne({
      where: { userId, locationId }
    });

    if (existing) {
      throw new Error("Location already in favorites");
    }

    const favorite = favoriteRepository.create({ userId, locationId });
    const saved = await favoriteRepository.save(favorite);
    
    // Return the favorite with location relation
    const favoriteWithLocation = await favoriteRepository.findOne({
      where: { id: saved.id },
      relations: ["location"]
    });
    
    return favoriteWithLocation!;
  }

  async getUserFavorites(userId: number): Promise<Favorite[]> {
    return await favoriteRepository.find({
      where: { userId },
      relations: ["location"],
      order: { createdAt: "DESC" }
    });
  }

  async deleteFavorite(id: number, userId: number): Promise<void> {
    const favorite = await favoriteRepository.findOne({
      where: { id, userId }
    });

    if (!favorite) {
      throw new Error("Favorite not found");
    }

    await favoriteRepository.remove(favorite);
  }

  async isFavorite(userId: number, locationId: number): Promise<boolean> {
    const favorite = await favoriteRepository.findOne({
      where: { userId, locationId }
    });
    return !!favorite;
  }
}

export const favoriteService = new FavoriteService();
