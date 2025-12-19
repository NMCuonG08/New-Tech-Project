import axios, { AxiosInstance } from "axios";

class AIClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.AI_SERVICE_URL || "http://localhost:3001";
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000, // 30 seconds
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async chat(message: string, sessionId?: string) {
    try {
      const response = await this.client.post("/api/ai/chat", {
        message,
        sessionId: sessionId || "default-session",
      });
      return response.data;
    } catch (error) {
      console.error("AI Service chat error:", error);
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message ||
            error.message ||
            "Failed to communicate with AI service"
        );
      }
      throw error;
    }
  }

  async getContext(sessionId: string) {
    try {
      const response = await this.client.get(`/api/ai/context/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error("AI Service getContext error:", error);
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message ||
            error.message ||
            "Failed to get context from AI service"
        );
      }
      throw error;
    }
  }

  async clearContext(sessionId: string) {
    try {
      const response = await this.client.delete(`/api/ai/context/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error("AI Service clearContext error:", error);
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message ||
            error.message ||
            "Failed to clear context from AI service"
        );
      }
      throw error;
    }
  }

  async getCurrentWeather(city: string) {
    try {
      const response = await this.client.post("/api/ai/weather/current", {
        city,
      });
      return response.data;
    } catch (error) {
      console.error("AI Service getCurrentWeather error:", error);
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message ||
            error.message ||
            "Failed to get weather from AI service"
        );
      }
      throw error;
    }
  }
}

export default new AIClient();

