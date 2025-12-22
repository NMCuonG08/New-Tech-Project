import { v4 as uuidv4 } from "uuid";
import { ChatSessionRepository } from "../repositories/ChatSessionRepository";
import { ChatMessageRepository } from "../repositories/ChatMessageRepository";
import { MessageRole } from "../entities/ChatMessage";

class SessionManagerService {
  /**
   * Validate if string is a valid UUID v4
   */
  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Get existing session or create new one
   */
  async getOrCreateSession(sessionId?: string, userId?: number) {
    // Validate sessionId if provided - must be valid UUID
    if (sessionId) {
      // Reject invalid UUIDs (e.g., error messages, garbage strings)
      if (!this.isValidUUID(sessionId)) {
        console.warn(`⚠️ Invalid sessionId received: "${sessionId}" - generating new UUID`);
        sessionId = undefined; // Force generate new UUID
      } else {
        // Try to find existing session
        const existingSession = await ChatSessionRepository.findBySessionId(
          sessionId
        );
        if (existingSession) {
          return existingSession;
        }
      }
    }

    // Create new session with valid UUID
    const newSessionId = sessionId || uuidv4();
    const session = await ChatSessionRepository.createSession(
      newSessionId,
      userId
    );

    return session;
  }

  /**
   * Get all sessions for a user
   */
  async getUserSessions(userId: number) {
    const sessions = await ChatSessionRepository.findByUserId(userId);

    // Add message count and first message preview as title
    return sessions.map((session) => ({
      id: session.id,
      title:
        session.title ||
        session.messages?.[0]?.content?.substring(0, 50) ||
        "New Chat",
      messageCount: session.messages?.length || 0,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      isAnonymous: session.isAnonymous,
    }));
  }

  /**
   * Get all messages in a session
   */
  async getSessionMessages(sessionId: string) {
    const messages = await ChatMessageRepository.findBySessionId(sessionId);
    return messages;
  }

  /**
   * Save a message to a session
   */
  async saveMessage(sessionId: string, role: MessageRole, content: string) {
    const message = await ChatMessageRepository.createMessage(
      sessionId,
      role,
      content
    );

    // Update session's updatedAt timestamp
    const session = await ChatSessionRepository.findBySessionId(sessionId);
    if (session) {
      session.updatedAt = new Date();
      await ChatSessionRepository.save(session);
    }

    return message;
  }

  /**
   * Delete a session and all its messages
   */
  async deleteSession(sessionId: string) {
    const session = await ChatSessionRepository.findBySessionId(sessionId);
    if (session) {
      await ChatSessionRepository.remove(session);
      return true;
    }
    return false;
  }

  /**
   * Generate UUID v4
   */
  generateSessionId(): string {
    return uuidv4();
  }
}

export default new SessionManagerService();
