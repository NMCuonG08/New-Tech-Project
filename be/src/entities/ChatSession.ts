import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { User } from "./User";
import { ChatMessage } from "./ChatMessage";

@Entity()
export class ChatSession {
  @PrimaryColumn("varchar", { length: 36 })
  id!: string; // UUID

  @Column({ nullable: true })
  userId?: number;

  @ManyToOne(() => User, (user) => user.chatSessions, { nullable: true })
  @JoinColumn({ name: "userId" })
  user?: User;

  @Column({ nullable: true, length: 500 })
  title?: string;

  @Column({ default: false })
  isAnonymous!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => ChatMessage, (message) => message.session, {
    cascade: true,
  })
  messages!: ChatMessage[];
}
