import "dotenv/config";

export const ENV = {
  PORT: parseInt(process.env.AI_SERVICE_PORT || "3001", 10),
  GROQ_API_KEY: (process.env.GROQ_API_KEY || "") as string,
  GEMINI_API_KEY: (process.env.GEMINI_API_KEY || "") as string,
  BACKEND_URL: process.env.BACKEND_URL || "http://localhost:3000",
};

