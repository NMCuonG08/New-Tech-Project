import { AppDataSource } from "../data-source";
import { ChatMessage, MessageRole } from "../entities/ChatMessage";

export const ChatMessageRepository = AppDataSource.getRepository(
  ChatMessage
).extend({
  findBySessionId(sessionId: string) {
    return this.find({
      where: { sessionId },
      order: { createdAt: "ASC" },
    });
  },

  async createMessage(sessionId: string, role: MessageRole, content: string) {
    const message = this.create({
      sessionId,
      role,
      content,
    });
    return this.save(message);
  },
});
