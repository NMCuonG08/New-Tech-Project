import { Request, Response } from "express";
import { alertService } from "../services/alertService";
import { AlertType } from "../entities/Alert";
import { alertMonitorService } from "../services/alertMonitorService";

export class AlertController {
  async createAlert(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { locationId, type, threshold, description } = req.body;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const alert = await alertService.createAlert(
        userId,
        locationId,
        type as AlertType,
        threshold,
        description
      );
      res.status(201).json(alert);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getUserAlerts(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const alerts = await alertService.getUserAlerts(userId);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getAlertById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const alert = await alertService.getAlertById(Number(id), userId);
      if (!alert) {
        res.status(404).json({ message: "Alert not found" });
        return;
      }

      res.json(alert);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async updateAlert(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      const updates = req.body;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const alert = await alertService.updateAlert(Number(id), userId, updates);
      res.json(alert);
    } catch (error: any) {
      if (error.message === "Alert not found") {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  }

  async deleteAlert(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      await alertService.deleteAlert(Number(id), userId);
      res.status(204).send();
    } catch (error: any) {
      if (error.message === "Alert not found") {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  }

  async getActiveAlertsByLocation(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { locationId } = req.params;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const alerts = await alertService.getActiveAlertsByLocation(userId, Number(locationId));
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async checkAlertsForLocation(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { locationId } = req.params;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const triggeredAlerts = await alertMonitorService.checkAlertsForLocation(
        Number(locationId),
        userId
      );

      res.json({
        triggered: triggeredAlerts.length > 0,
        alerts: triggeredAlerts.map(ta => ({
          id: ta.alert.id,
          type: ta.alert.type,
          threshold: ta.alert.threshold,
          currentValue: ta.currentValue,
          locationName: ta.locationName,
          description: ta.alert.description
        }))
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export const alertController = new AlertController();
