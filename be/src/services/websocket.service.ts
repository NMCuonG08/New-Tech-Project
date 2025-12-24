import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env";

interface AuthenticatedSocket extends Socket {
  userId?: number;
}

class WebSocketService {
  private io: Server | null = null;
  private userSockets: Map<number, Set<string>> = new Map(); // userId -> Set of socketIds

  initialize(httpServer: HttpServer, corsOrigins: string[]) {
    this.io = new Server(httpServer, {
      cors: {
        origin: corsOrigins,
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    // Authentication middleware
    this.io.use((socket: AuthenticatedSocket, next) => {
      const token = socket.handshake.auth.token;
      
      console.log('🔐 WebSocket auth attempt:', {
        hasToken: !!token,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'none',
        jwtSecret: ENV.JWT_SECRET ? '***exists***' : 'MISSING',
      });
      
      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      try {
        const decoded = jwt.verify(token, ENV.JWT_SECRET) as { id: number };
        console.log('✅ Token decoded successfully:', { userId: decoded.id });
        socket.userId = decoded.id;
        next();
      } catch (err: any) {
        console.error('❌ Token verification failed:', err.message);
        next(new Error("Authentication error: Invalid token"));
      }
    });

    // Handle connections
    this.io.on("connection", (socket: AuthenticatedSocket) => {
      const userId = socket.userId!;
      console.log(`✅ WebSocket client connected: ${socket.id} (User: ${userId})`);

      // Track user's socket
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(socket.id);

      // Join user's personal room
      socket.join(`user_${userId}`);

      // Handle disconnect
      socket.on("disconnect", () => {
        console.log(`❌ WebSocket client disconnected: ${socket.id} (User: ${userId})`);
        
        // Remove from tracking
        const userSocketSet = this.userSockets.get(userId);
        if (userSocketSet) {
          userSocketSet.delete(socket.id);
          if (userSocketSet.size === 0) {
            this.userSockets.delete(userId);
          }
        }
      });

      // Handle ping for keeping connection alive
      socket.on("ping", () => {
        socket.emit("pong");
      });
    });

    console.log("🌐 WebSocket Service initialized");
  }

  // Broadcast to all connected users
  broadcastToAll(event: string, data: any) {
    if (this.io) {
      this.io.emit(event, data);
      console.log(`📡 Broadcast to all: ${event}`, data);
    }
  }

  // Send to specific user (all their connections)
  sendToUser(userId: number, event: string, data: any) {
    if (this.io) {
      this.io.to(`user_${userId}`).emit(event, data);
      console.log(`📨 Sent to user ${userId}: ${event}`, data);
    }
  }

  // Send to multiple specific users
  sendToUsers(userIds: number[], event: string, data: any) {
    if (this.io) {
      userIds.forEach(userId => {
        this.io!.to(`user_${userId}`).emit(event, data);
      });
      console.log(`📨 Sent to ${userIds.length} users: ${event}`, data);
    }
  }

  // Check if user is online
  isUserOnline(userId: number): boolean {
    return this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0;
  }

  // Get online users count
  getOnlineUsersCount(): number {
    return this.userSockets.size;
  }

  // Get all online user IDs
  getOnlineUserIds(): number[] {
    return Array.from(this.userSockets.keys());
  }
}

export const webSocketService = new WebSocketService();
