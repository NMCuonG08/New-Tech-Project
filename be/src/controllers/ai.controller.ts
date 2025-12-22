import { Request, Response } from "express";
import aiClient from "../services/aiClient";
import sessionManager from "../services/sessionManager.service";
import { ChatRequestDto } from "../dtos/ChatRequestDto";
import { WeatherRequestDto } from "../dtos/WeatherRequestDto";
import { SessionIdParamDto } from "../dtos/SessionIdParamDto";
import { MessageRole } from "../entities/ChatMessage";

export const chat = async (req: Request, res: Response) => {
  try {
    const dto = (req as any).dto as ChatRequestDto;

    // Extract user ID from JWT token if authenticated
    const userId = (req as any).user?.id;
    
    console.log("🔍 Chat request:", {
      hasToken: !!req.headers.authorization,
      userId,
      sessionIdFromClient: dto.sessionId,
      isAnonymous: !userId
    });

    // Get or create session
    const session = await sessionManager.getOrCreateSession(
      dto.sessionId,
      userId
    );
    
    console.log("✅ Session created/retrieved:", {
      sessionId: session.id,
      userId: session.userId,
      isAnonymous: session.isAnonymous
    });

    // Save user message to database
    await sessionManager.saveMessage(
      session.id,
      MessageRole.USER,
      dto.message
    );

    // Call AI service
    const result = await aiClient.chat(dto.message, session.id);

    // Save AI response to database
    await sessionManager.saveMessage(
      session.id,
      MessageRole.ASSISTANT,
      result.response || result.message || ""
    );

    // Return response with sessionId
    res.json({
      ...result,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Chat endpoint error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: errorMessage,
    });
  }
};

export const getContext = async (req: Request, res: Response) => {
  try {
    const dto = (req as any).dto as SessionIdParamDto;
    const result = await aiClient.getContext(dto.sessionId);
    res.json(result);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
};

export const clearContext = async (req: Request, res: Response) => {
  try {
    const dto = (req as any).dto as SessionIdParamDto;
    const result = await aiClient.clearContext(dto.sessionId);
    res.json(result);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
};

export const getCurrentWeather = async (req: Request, res: Response) => {
  try {
    const dto = (req as any).dto as WeatherRequestDto;
    const result = await aiClient.getCurrentWeather(dto.city);
    res.json(result);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
};
