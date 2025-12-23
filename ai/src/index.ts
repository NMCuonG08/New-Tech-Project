import "reflect-metadata";
import express from "express";
import cors from "cors";
import { ENV } from "./config/env";
import aiRoutes from "./routes/ai.route";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    service: "AI Weather Service",
    status: "running",
    version: "1.0.0",
  });
});

app.get("/health", (_req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/ai", aiRoutes);

app.listen(ENV.PORT, () => {
  console.log(` AI Service is running at http://localhost:${ENV.PORT}`);
  console.log(` API endpoints available at http://localhost:${ENV.PORT}/api/ai`);
});

