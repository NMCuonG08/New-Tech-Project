import "reflect-metadata";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { AppDataSource } from "./data-source";
import { ENV } from "./config/env";
import authRoutes from "./routes/authRoutes";
import aiRoutes from "./routes/ai.route";
import locationRoutes from "./routes/locationRoutes";
import weatherRoutes from "./routes/weatherRoutes";
import favoriteRoutes from "./routes/favoriteRoutes";
import alertRoutes from "./routes/alertRoutes";
import noteRoutes from "./routes/noteRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import { seedAdminUser } from "./seeds/adminSeed";
import dotenv from "dotenv";
import session from "express-session";
import "./config/passport";
import passport from "passport";
import { alertMonitorService } from "./services/alertMonitorService";
import { websocketService } from "./services/websocketService";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling']
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);

  // Handle user joining their room
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`📡 User ${userId} joined room`);
  });

  // Handle test alert request
  socket.on('test', (data) => {
    console.log('🧪 Test alert requested by:', socket.id, data);
    
    // Send test alert back to the client
    socket.emit('test-alert', {
      type: 'test',
      message: 'Test alert from server',
      city: 'Test City',
      timestamp: new Date().toISOString(),
      severity: 'medium'
    });
    
    console.log('🧪 Test alert sent to client');
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// Make io accessible to other parts of the app
app.set('io', io);

// Initialize WebSocket service
websocketService.initialize(io);

// Session configuration - required for Passport
app.use(
  session({
    secret: process.env.SESSION_SECRET || "123",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", 
      maxAge: 24 * 60 * 60 * 1000, 
    },
  })
);

// CORS configuration - cho phép FE connect
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", 
    credentials: true, 
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Tăng limit body size để upload ảnh chất lượng cao
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (_req, res) => {
  res.send("Hello from Express + TypeScript + TypeORM!");
});

app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/dashboard", dashboardRoutes);
AppDataSource.initialize()
  .then(async () => {
    console.log("Data Source has been initialized");

    // Seed admin user
    await seedAdminUser();

    // Start alert monitoring service
    alertMonitorService.startMonitoring();

    httpServer.listen(ENV.PORT, () => {
      console.log(`Server is running at http://localhost:${ENV.PORT}`);
      console.log(`WebSocket server is ready`);
    });
  })
  .catch((error) => {
    console.error("Error during Data Source initialization:", error);
  });
