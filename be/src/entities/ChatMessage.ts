import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { ChatSession } from "./ChatSession";

export enum MessageRole {
  USER = "user",
  ASSISTANT = "assistant",
}

@Entity()
export class ChatMessage {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("varchar", { length: 36 })
  sessionId!: string;

  @ManyToOne(() => ChatSession, (session) => session.messages, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "sessionId" })
  session!: ChatSession;

  @Column({
    type: "enum",
    enum: MessageRole,
  })
  role!: MessageRole;

  @Column("text")
  content!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
