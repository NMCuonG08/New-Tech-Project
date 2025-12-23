import { GoogleGenerativeAI } from "@google/generative-ai";
import { ENV } from "./env";

if (!ENV.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is required in environment variables");
}

const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY as string);

const model = genAI.getGenerativeModel({
  model: "gemma-3-12b-it", //gemini-2.5-flash-lite  //gemma-3-12b-it
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 2048,
  },
});

export { model };

