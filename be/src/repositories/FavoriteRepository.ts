import { AppDataSource } from "../data-source";
import { Favorite } from "../entities/Favorite";

export const favoriteRepository = AppDataSource.getRepository(Favorite);
