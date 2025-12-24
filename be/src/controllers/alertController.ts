import { Request, Response } from "express";
import { alertService } from "../services/alertService";
import { AlertType } from "../entities/Alert";
import { webSocketService } from "../services/websocket.service";
import { systemAlertRepository } from "../repositories/SystemAlertRepository";
import { SystemAlertSeverity, SystemAlert } from "../entities/SystemAlert";

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

  // ADMIN: Broadcast system alert to all users
  async broadcastSystemAlert(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { title, message, severity, locationId, expiresAt } = req.body;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      // Create system alert
      const alertData: any = {
        title,
        message,
        severity: severity || SystemAlertSeverity.INFO,
        createdBy: userId,
        isActive: true,
      };

      if (locationId) {
        alertData.locationId = locationId;
      }

      if (expiresAt) {
        alertData.expiresAt = new Date(expiresAt);
      }

      const systemAlert = systemAlertRepository.create(alertData) as unknown as SystemAlert;
      const savedAlert = await systemAlertRepository.save(systemAlert);

      // Broadcast via WebSocket
      webSocketService.broadcastToAll("system_alert", {
        id: savedAlert.id,
        title: savedAlert.title,
        message: savedAlert.message,
        severity: savedAlert.severity,
        locationId: savedAlert.locationId,
        createdAt: savedAlert.createdAt,
        expiresAt: savedAlert.expiresAt,
      });

      res.status(201).json({
        success: true,
        data: savedAlert,
        message: "Alert broadcasted successfully"
      });
    } catch (error) {
      console.error("Broadcast alert error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  // ADMIN: Get all system alerts
  async getSystemAlerts(req: Request, res: Response): Promise<void> {
    try {
      const alerts = await systemAlertRepository.findActiveAlerts();
      res.json({ success: true, data: alerts });
    } catch (error) {
      console.error("Get system alerts error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  // ADMIN: Delete system alert
  async deleteSystemAlert(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({ message: "Alert ID is required" });
        return;
      }
      
      const alert = await systemAlertRepository.findOne({ where: { id: parseInt(id) } });
      
      if (!alert) {
        res.status(404).json({ message: "Alert not found" });
        return;
      }

      await systemAlertRepository.remove(alert);
      res.json({ success: true, message: "Alert deleted successfully" });
    } catch (error) {
      console.error("Delete system alert error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  // PUBLIC: Get active system alerts (for all users)
  async getActiveSystemAlerts(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔍 Fetching active system alerts...');
      const alerts = await systemAlertRepository.findActiveAlerts();
      console.log(`✅ Found ${alerts.length} active system alerts`);
      res.json({ success: true, data: alerts });
    } catch (error) {
      console.error("Get active system alerts error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export const alertController = new AlertController();
