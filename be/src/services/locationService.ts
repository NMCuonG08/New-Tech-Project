import { locationRepository } from "../repositories/LocationRepository";
import { Location } from "../entities/Location";
import { Like } from "typeorm";

export class LocationService {
  async create(data: Partial<Location>): Promise<Location> {
    const location = locationRepository.create(data);
    return await locationRepository.save(location);
  }

  async findAll(): Promise<Location[]> {
    return await locationRepository.find({
      order: { name: "ASC" },
    });
  }

  async findAllPaginated(
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: Location[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
    const skip = (page - 1) * limit;
    
    const [data, total] = await locationRepository.findAndCount({
      order: { name: "ASC" },
      skip,
      take: limit,
    });
    
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: number): Promise<Location | null> {
    return await locationRepository.findOne({ where: { id } });
  }

  async update(id: number, data: Partial<Location>): Promise<Location | null> {
    const location = await locationRepository.findOne({ where: { id } });
    if (!location) {
      return null;
    }
    Object.assign(location, data);
    return await locationRepository.save(location);
  }

  async delete(id: number): Promise<boolean> {
    const result = await locationRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async search(query: string): Promise<Location[]> {
    const searchQuery = query.trim();
    if (!searchQuery) {
      return [];
    }
    
    try {
      // Try full text search first
      const fullTextResults = await locationRepository
        .createQueryBuilder("location")
        .where("MATCH(location.name) AGAINST(:query IN NATURAL LANGUAGE MODE)", {
          query: searchQuery,
        })
        .orderBy("location.name", "ASC")
        .getMany();
      
      if (fullTextResults.length > 0) {
        return fullTextResults;
      }
    } catch (error) {
      // Full text search might not be available, fallback to LIKE
      console.warn("Full text search not available, using LIKE fallback:", error);
    }
    
    // Fallback to LIKE search
    return await locationRepository
      .createQueryBuilder("location")
      .where("location.name LIKE :likeQuery", { likeQuery: `%${searchQuery}%` })
      .orWhere("location.province LIKE :likeQuery", { likeQuery: `%${searchQuery}%` })
      .orderBy("location.name", "ASC")
      .getMany();
  }

  async findByProvince(province: string): Promise<Location[]> {
    return await locationRepository.find({
      where: { province },
      order: { name: "ASC" },
    });
  }
}

export const locationService = new LocationService();

