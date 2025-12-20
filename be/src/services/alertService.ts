import { alertRepository } from "../repositories/AlertRepository";
import { Alert, AlertType } from "../entities/Alert";

export class AlertService {
  async createAlert(
    userId: number,
    locationId: number,
    type: AlertType,
    threshold?: number,
    description?: string
  ): Promise<Alert> {
    const alertData: any = {
      userId,
      locationId,
      type,
      isActive: true
    };

    if (threshold !== undefined) {
      alertData.threshold = threshold;
    }
    if (description !== undefined) {
      alertData.description = description;
    }

    const alert = alertRepository.create(alertData);
    const savedAlert = await alertRepository.save(alert);
    return Array.isArray(savedAlert) ? savedAlert[0]! : savedAlert;
  }

  async getUserAlerts(userId: number): Promise<Alert[]> {
    return await alertRepository.find({
      where: { userId },
      relations: ["location"],
      order: { createdAt: "DESC" }
    });
  }

  async getAlertById(id: number, userId: number): Promise<Alert | null> {
    return await alertRepository.findOne({
      where: { id, userId },
      relations: ["location"]
    });
  }

  async updateAlert(
    id: number,
    userId: number,
    updates: {
      type?: AlertType;
      threshold?: number;
      description?: string;
      isActive?: boolean;
    }
  ): Promise<Alert> {
    const alert = await alertRepository.findOne({
      where: { id, userId }
    });

    if (!alert) {
      throw new Error("Alert not found");
    }

    Object.assign(alert, updates);
    return await alertRepository.save(alert);
  }

  async deleteAlert(id: number, userId: number): Promise<void> {
    const alert = await alertRepository.findOne({
      where: { id, userId }
    });

    if (!alert) {
      throw new Error("Alert not found");
    }

    await alertRepository.remove(alert);
  }

  async getActiveAlertsByLocation(userId: number, locationId: number): Promise<Alert[]> {
    return await alertRepository.find({
      where: {
        userId,
        locationId,
        isActive: true
      }
    });
  }
}

export const alertService = new AlertService();
