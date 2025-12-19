import { AppDataSource } from "../data-source";
import { Location } from "../entities/Location";

export const locationRepository = AppDataSource.getRepository(Location);

