import Groq from "groq-sdk";
import { ENV } from "./env";

if (!ENV.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is required in environment variables");
}

// Initialize Groq client
const groq = new Groq({
  apiKey: ENV.GROQ_API_KEY,
});

// Configuration for consistency with previous Gemini setup
const MODEL_CONFIG = {
  model: "llama-3.3-70b-versatile", // Fast and capable model
  temperature: 0.7,
  max_tokens: 2048,
  top_p: 0.95,
};

/**
 * Generate content using Groq API (compatible with Gemini interface)
 */
export async function generateContent(prompt: string): Promise<any> {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      ...MODEL_CONFIG,
    });

    const text = chatCompletion.choices[0]?.message?.content || "";

  
    return {
      response: {
        text: () => text,
      },
    };
  } catch (error) {
    console.error("Groq API Error:", error);
    throw error;
  }
}

// Export model-like object for compatibility
export const model = {
  generateContent,
};

export { groq };
