import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from "typeorm";
import { User } from "./User";
import { Location } from "./Location";

@Entity()
@Index(["userId", "locationId"], { unique: true })
export class Favorite {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @Column()
  locationId!: number;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @ManyToOne(() => Location, { onDelete: "CASCADE" })
  @JoinColumn({ name: "locationId" })
  location!: Location;

  @CreateDateColumn()
  createdAt!: Date;
}
