import "dotenv/config";

export const ENV = {
  PORT: parseInt(process.env.PORT || "3000", 10),
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: parseInt(process.env.DB_PORT || "3306", 10),
  DB_USERNAME: process.env.DB_USERNAME || "root",
  DB_PASSWORD: process.env.DB_PASSWORD || "",
  DB_NAME: process.env.DB_NAME || "my_app_db",
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || "http://localhost:3001",
  JWT_SECRET: (() => {
    const secret = process.env.JWT_SECRET || "your-secret-key-change-in-production";
    if (!process.env.JWT_SECRET) {
      console.warn("⚠️  WARNING: JWT_SECRET not set in .env, using default value. This is INSECURE for production!");
    }
    return secret;
  })(),
};
