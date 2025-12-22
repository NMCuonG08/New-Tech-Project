import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import sessionManager from "../services/sessionManager.service";

const router = Router();

/**
 * GET /api/chat/sessions
 * Get all sessions for current user (requires auth)
 */
router.get("/sessions", verifyToken, async (req, res) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const sessions = await sessionManager.getUserSessions(userId);

    res.json({
      success: true,
      sessions,
    });
  } catch (error) {
    console.error("Get sessions error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get sessions",
    });
  }
});

/**
 * GET /api/chat/sessions/:sessionId/messages
 * Get all messages for a specific session
 */
router.get("/sessions/:sessionId/messages", async (req, res) => {
  try {
    const { sessionId } = req.params;

    const messages = await sessionManager.getSessionMessages(sessionId);

    res.json({
      success: true,
      messages: messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get messages",
    });
  }
});

/**
 * POST /api/chat/sessions
 * Create a new chat session
 */
router.post("/sessions", async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const sessionId = sessionManager.generateSessionId();

    const session = await sessionManager.getOrCreateSession(sessionId, userId);

    res.json({
      success: true,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Create session error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create session",
    });
  }
});

/**
 * DELETE /api/chat/sessions/:sessionId
 * Delete a chat session
 */
router.delete("/sessions/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    const deleted = await sessionManager.deleteSession(sessionId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "Session not found",
      });
    }

    res.json({
      success: true,
      message: "Session deleted successfully",
    });
  } catch (error) {
    console.error("Delete session error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete session",
    });
  }
});

export default router;
