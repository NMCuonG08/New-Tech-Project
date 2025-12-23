import { AppDataSource } from "../data-source";
import { ChatSession } from "../entities/ChatSession";

import { DeepPartial } from "typeorm";

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

  async createSession(sessionId: string, userId?: number): Promise<ChatSession> {
    const sessionData: DeepPartial<ChatSession> = {
      id: sessionId,
      isAnonymous: !userId,
    };
    
    if (userId !== undefined) {
      sessionData.userId = userId;
    }

    const session = this.create(sessionData);
    return this.save(session);
  },
});
