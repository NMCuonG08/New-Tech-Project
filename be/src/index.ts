import "reflect-metadata";
import express from "express";
import cors from "cors";
import { AppDataSource } from "./data-source";
import { ENV } from "./config/env";
import authRoutes from "./routes/authRoutes";
import aiRoutes from "./routes/ai.route";
import dotenv from "dotenv";
import session from "express-session";
import "./config/passport";
import passport from "passport";

dotenv.config();

const app = express();

// Session configuration - required for Passport
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// CORS configuration - cho phép FE connect
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Vite default port
    credentials: true, // Cho phép gửi cookies/auth headers
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (_req, res) => {
  res.send("Hello from Express + TypeScript + TypeORM!");
});

app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized");

    app.listen(ENV.PORT, () => {
      console.log(`Server is running at http://localhost:${ENV.PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error during Data Source initialization:", error);
  });
