import { alertService } from "./alertService";
import { weatherService } from "./weatherService";
import { Alert } from "../entities/Alert";
import { websocketService } from "./websocketService";

interface TriggeredAlert {
  alert: Alert;
  currentValue: number;
  locationName: string;
}

export class AlertMonitorService {
  private monitoringInterval: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes
  private lastTriggeredAlerts: Map<number, number> = new Map(); // alertId -> last triggered timestamp

  async startMonitoring(): Promise<void> {
    if (this.monitoringInterval) {
      console.log("Alert monitoring is already running");
      return;
    }

    console.log("Starting alert monitoring service...");
    
    // Run initial check
    await this.checkAllAlerts();

    // Schedule periodic checks
    this.monitoringInterval = setInterval(async () => {
      await this.checkAllAlerts();
    }, this.CHECK_INTERVAL);

    console.log(`Alert monitoring started. Checking every ${this.CHECK_INTERVAL / 1000} seconds`);
  }

  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log("Alert monitoring stopped");
    }
  }

  async checkAllAlerts(): Promise<TriggeredAlert[]> {
    try {
      const activeAlerts = await alertService.getAllActiveAlerts();
      const triggeredAlerts: TriggeredAlert[] = [];

      if (activeAlerts.length === 0) {
        return triggeredAlerts;
      }

      console.log(`Checking ${activeAlerts.length} active alerts...`);

      // Group alerts by location to minimize API calls
      const alertsByLocation = new Map<number, Alert[]>();
      
      for (const alert of activeAlerts) {
        if (!alert.location) continue;
        
        const locationId = alert.location.id;
        if (!alertsByLocation.has(locationId)) {
          alertsByLocation.set(locationId, []);
        }
        alertsByLocation.get(locationId)!.push(alert);
      }

      // Check each location's alerts
      for (const [locationId, alerts] of alertsByLocation.entries()) {
        const location = alerts[0]?.location;
        if (!location || !location.name) continue;

        console.log(`Checking ${alerts.length} alerts for location: ${location.name}`);

        try {
          // Fetch current weather for this location
          const weatherData = await weatherService.getCurrentWeather(
            location.name,
            "metric"
          );
          console.log(`Weather data fetched for ${location.name}:`, {
            temp: weatherData.main?.temp,
            humidity: weatherData.main?.humidity,
            windSpeed: weatherData.wind?.speed,
            weather: weatherData.weather?.[0]?.description
          });

          // Evaluate each alert for this location
          for (const alert of alerts) {
            console.log(`  Evaluating alert #${alert.id}: type=${alert.type}, threshold=${alert.threshold}`);
            const result = alertService.evaluateAlert(alert, weatherData);
            console.log(`  Result: triggered=${result.triggered}, value=${result.value}`);

            if (result.triggered && result.value !== null) {
              // Check if we recently triggered this alert (avoid spam)
              const lastTriggered = this.lastTriggeredAlerts.get(alert.id);
              const now = Date.now();
              const cooldownPeriod = 30 * 60 * 1000; // 30 minutes cooldown

              if (!lastTriggered || now - lastTriggered > cooldownPeriod) {
                triggeredAlerts.push({
                  alert,
                  currentValue: result.value,
                  locationName: location.name
                });

                this.lastTriggeredAlerts.set(alert.id, now);

                console.log(`🚨 Alert triggered: ${alert.type} for ${location.name} - Value: ${result.value}, Threshold: ${alert.threshold}`);
                
                // Emit WebSocket alert to user
                if (alert.user && websocketService.isInitialized()) {
                  const alertMessage = this.formatAlertMessage(alert, result.value, location.name);
                  console.log(`📤 Sending alert to user ${alert.userId} via WebSocket:`, alertMessage);
                  websocketService.emitAlertToUser(alert.userId, alertMessage);
                } else {
                  console.warn(`⚠️ Cannot send alert: user=${!!alert.user}, ws_initialized=${websocketService.isInitialized()}`);
                }
              }
            }
          }
        } catch (error) {
          console.error(`Error checking alerts for location ${location.name}:`, error);
        }
      }

      return triggeredAlerts;
    } catch (error) {
      console.error("Error in checkAllAlerts:", error);
      return [];
    }
  }

  private formatAlertMessage(alert: Alert, currentValue: number, locationName: string) {
    const severityMap: Record<string, 'low' | 'medium' | 'high'> = {
      temperature_high: 'high',
      temperature_low: 'medium',
      rain: 'medium',
      wind: 'high',
      humidity: 'low',
      aqi: 'high'
    };

    let message = '';
    
    switch (alert.type) {
      case 'temperature_high':
        message = `High temperature: ${currentValue.toFixed(1)}°C (threshold: ${alert.threshold}°C)`;
        break;
      case 'temperature_low':
        message = `Low temperature: ${currentValue.toFixed(1)}°C (threshold: ${alert.threshold}°C)`;
        break;
      case 'rain':
        message = `Rain detected: ${currentValue.toFixed(1)}mm (threshold: ${alert.threshold}mm)`;
        break;
      case 'wind':
        message = `High wind speed: ${currentValue.toFixed(1)} km/h (threshold: ${alert.threshold} km/h)`;
        break;
      case 'humidity':
        message = `High humidity: ${currentValue.toFixed(1)}% (threshold: ${alert.threshold}%)`;
        break;
      case 'aqi':
        message = `Poor air quality: ${currentValue.toFixed(0)} AQI (threshold: ${alert.threshold})`;
        break;
      default:
        message = `Alert triggered: ${currentValue}`;
    }

    return {
      type: alert.type,
      city: locationName,
      message,
      severity: severityMap[alert.type] || 'medium',
      currentValue,
      threshold: alert.threshold,
      description: alert.description,
      timestamp: new Date().toISOString()
    };
  }

  async checkAlertsForLocation(locationId: number, userId: number): Promise<TriggeredAlert[]> {
    try {
      const alerts = await alertService.getActiveAlertsByLocation(userId, locationId);
      
      if (alerts.length === 0) {
        return [];
      }

      const location = alerts[0]?.location;
      if (!location || !location.name) {
        return [];
      }

      const weatherData = await weatherService.getCurrentWeather(location.name, "metric");
      const triggeredAlerts: TriggeredAlert[] = [];

      for (const alert of alerts) {
        const result = alertService.evaluateAlert(alert, weatherData);

        if (result.triggered && result.value !== null) {
          triggeredAlerts.push({
            alert,
            currentValue: result.value,
            locationName: location.name
          });
        }
      }

      return triggeredAlerts;
    } catch (error) {
      console.error(`Error checking alerts for location ${locationId}:`, error);
      return [];
    }
  }
}

export const alertMonitorService = new AlertMonitorService();
