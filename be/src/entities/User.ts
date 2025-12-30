import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Favorite } from "./Favorite";
import { Alert } from "./Alert";
import { Note } from "./Note";
import { ChatSession } from "./ChatSession";

export enum UserRole {
  USER = "user",
  ADMIN = "admin"
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  username!: string;

  @Column({ nullable: true })
  password!: string;

  @Column({ unique: true, nullable: true })
  email?: string | null;

  @Column({ unique: true, nullable: true })
  googleId?: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.USER
  })
  role!: UserRole;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites!: Favorite[];

  @OneToMany(() => Alert, (alert) => alert.user)
  alerts!: Alert[];

  @OneToMany(() => Note, (note) => note.user)
  notes!: Note[];

  @OneToMany(() => ChatSession, (session) => session.user)
  chatSessions!: ChatSession[];
}
