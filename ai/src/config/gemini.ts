import { GoogleGenerativeAI } from "@google/generative-ai";
import { ENV } from "./env";

if (!ENV.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is required in environment variables");
}

const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY as string);

// Use Gemini 1.5 Pro for best results
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 2048,
  },
});

export { model };

