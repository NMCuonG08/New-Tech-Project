import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
@Index(["name"], { fulltext: true })
export class Location {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  province?: string;

  @Column({ type: "decimal", precision: 10, scale: 7, nullable: true })
  lat?: number;

  @Column({ type: "decimal", precision: 10, scale: 7, nullable: true })
  lon?: number;


  @Column({ type: "varchar", length: 100, nullable: true })
  timezone?: string;

  @Column({ type: "varchar", length: 10, nullable: true })
  countryCode?: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "json", nullable: true })
  images?: string[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

