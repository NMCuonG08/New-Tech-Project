import "reflect-metadata";
import express from "express";
import cors from "cors";
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

dotenv.config();

const app = express();

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

    app.listen(ENV.PORT, () => {
      console.log(`Server is running at http://localhost:${ENV.PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error during Data Source initialization:", error);
  });
