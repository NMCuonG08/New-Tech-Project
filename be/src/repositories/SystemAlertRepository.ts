import { AppDataSource } from "../data-source";
import { SystemAlert } from "../entities/SystemAlert";

export const systemAlertRepository = AppDataSource.getRepository(SystemAlert).extend({
  findActiveAlerts() {
    return this.createQueryBuilder("alert")
      .where("alert.isActive = :isActive", { isActive: true })
      .andWhere("(alert.expiresAt IS NULL OR alert.expiresAt > :now)", { now: new Date() })
      .orderBy("alert.createdAt", "DESC")
      .getMany();
  },

  findByLocationId(locationId: number) {
    return this.createQueryBuilder("alert")
      .where("alert.isActive = :isActive", { isActive: true })
      .andWhere("alert.locationId = :locationId", { locationId })
      .andWhere("(alert.expiresAt IS NULL OR alert.expiresAt > :now)", { now: new Date() })
      .orderBy("alert.createdAt", "DESC")
      .getMany();
  },
});
