import "dotenv/config";

export const ENV = {
  PORT: parseInt(process.env.PORT || "3000", 10),
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: parseInt(process.env.DB_PORT || "3306", 10),
  DB_USERNAME: process.env.DB_USERNAME || "root",
  DB_PASSWORD: process.env.DB_PASSWORD || "",
  DB_NAME: process.env.DB_NAME || "my_app_db",
  GEMINI_API_KEY: (process.env.GEMINI_API_KEY || "") as string,
};
