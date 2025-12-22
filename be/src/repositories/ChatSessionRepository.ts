import { AppDataSource } from "../data-source";
import { ChatSession } from "../entities/ChatSession";

export const ChatSessionRepository = AppDataSource.getRepository(
  ChatSession
).extend({
  findByUserId(userId: number) {
    return this.find({
      where: { userId },
      order: { updatedAt: "DESC" },
      relations: ["messages"],
    });
  },

  findBySessionId(sessionId: string) {
    return this.findOne({
      where: { id: sessionId },
      relations: ["messages"],
    });
  },

  async createSession(sessionId: string, userId?: number) {
    const session = this.create({
      id: sessionId,
      userId,
      isAnonymous: !userId,
    });
    return this.save(session);
  },
});
