import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@Index(['service', 'permission'], { unique: true })
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 160 })
  @Index()
  service: string;

  @Column({ length: 160 })
  permission: string;

  @CreateDateColumn()
  created: Date;
}
