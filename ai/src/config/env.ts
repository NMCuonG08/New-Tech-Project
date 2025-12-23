import "dotenv/config";

export const ENV = {
  PORT: parseInt(process.env.AI_SERVICE_PORT || "3001", 10),
  GROQ_API_KEY: (process.env.GROQ_API_KEY || "") as string,
};

