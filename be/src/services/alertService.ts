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

  async getAllActiveAlerts(): Promise<Alert[]> {
    return await alertRepository.find({
      where: { isActive: true },
      relations: ["location", "user"]
    });
  }

  evaluateAlert(alert: Alert, weatherData: any): { triggered: boolean; value: number | null } {
    if (!weatherData || !alert.threshold) {
      return { triggered: false, value: null };
    }

    let currentValue: number | null = null;
    let triggered = false;

    switch (alert.type) {
      case AlertType.TEMPERATURE_HIGH:
        currentValue = weatherData.main?.temp ?? null;
        if (currentValue !== null) {
          triggered = currentValue > alert.threshold;
        }
        break;

      case AlertType.TEMPERATURE_LOW:
        currentValue = weatherData.main?.temp ?? null;
        if (currentValue !== null) {
          triggered = currentValue < alert.threshold;
        }
        break;

      case AlertType.RAIN:
        // Check precipitation probability or rain volume
        currentValue = weatherData.rain?.['1h'] ?? weatherData.rain?.['3h'] ?? 0;
        if (currentValue !== null) {
          triggered = currentValue > alert.threshold;
        }
        break;

      case AlertType.WIND:
        currentValue = weatherData.wind?.speed ?? null;
        if (currentValue !== null) {
          // Convert wind speed to km/h if needed (assuming m/s)
          const windKmh = currentValue * 3.6;
          triggered = windKmh > alert.threshold;
        }
        break;

      case AlertType.HUMIDITY:
        currentValue = weatherData.main?.humidity ?? null;
        if (currentValue !== null) {
          triggered = currentValue > alert.threshold;
        }
        break;

      case AlertType.AQI:
        // AQI would need separate API integration
        currentValue = weatherData.aqi ?? null;
        if (currentValue !== null) {
          triggered = currentValue > alert.threshold;
        }
        break;
    }

    return { triggered, value: currentValue };
  }
}

export const alertService = new AlertService();
