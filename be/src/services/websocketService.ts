import { Server } from "socket.io";

class WebSocketService {
  private io: Server | null = null;

  initialize(io: Server) {
    this.io = io;
    console.log("📡 WebSocket service initialized");
  }

  // Emit weather alert to specific user
  emitAlertToUser(userId: number, alert: any) {
    if (!this.io) {
      console.warn("WebSocket not initialized");
      return;
    }

    const room = `user_${userId}`;
    console.log(`📤 Emitting alert to user ${userId}:`, alert);
    
    this.io.to(room).emit('weather-alert', alert);
  }

  // Emit alert to all connected users
  emitAlertToAll(alert: any) {
    if (!this.io) {
      console.warn("WebSocket not initialized");
      return;
    }

    console.log(`📤 Broadcasting alert to all users:`, alert);
    this.io.emit('weather-alert', alert);
  }

  // Emit general notification to user
  emitNotificationToUser(userId: number, notification: any) {
    if (!this.io) {
      console.warn("WebSocket not initialized");
      return;
    }

    const room = `user_${userId}`;
    this.io.to(room).emit('notification', notification);
  }

  // Get connection status
  isInitialized(): boolean {
    return this.io !== null;
  }
}

export const websocketService = new WebSocketService();
