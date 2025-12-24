import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

export enum SystemAlertSeverity {
  INFO = "info",
  WARNING = "warning",
  DANGER = "danger",
  CRITICAL = "critical"
}

@Entity()
export class SystemAlert {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column("text")
  message!: string;

  @Column({
    type: "enum",
    enum: SystemAlertSeverity,
    default: SystemAlertSeverity.INFO
  })
  severity!: SystemAlertSeverity;

  @Column({ nullable: true })
  locationId?: number;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ nullable: true })
  createdBy?: number; // Admin user ID

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: "datetime", nullable: true })
  expiresAt?: Date;
}
