import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";
import { Location } from "./Location";

export enum AlertType {
  TEMPERATURE_HIGH = "temperature_high",
  TEMPERATURE_LOW = "temperature_low",
  RAIN = "rain",
  WIND = "wind",
  AQI = "aqi",
  HUMIDITY = "humidity"
}

@Entity()
export class Alert {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @Column()
  locationId!: number;

  @Column({
    type: "enum",
    enum: AlertType
  })
  type!: AlertType;

  @Column({ type: "float", nullable: true })
  threshold?: number;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @ManyToOne(() => Location, { onDelete: "CASCADE" })
  @JoinColumn({ name: "locationId" })
  location!: Location;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
