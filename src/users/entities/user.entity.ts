import { Entity, CreateDateColumn, Column, Index, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class User {
  // set length to 254 to be email address compatible, https://www.rfc-editor.org/errata_search.php?rfc=3696
  @PrimaryColumn({ length: 254 })
  username: string;

  @Column({ length: 256, select: false })
  password: string;

  @Column({ length: 64 })
  hashAlgorithm: string;

  @Column({ length: 160 })
  displayName: string;

  // manual lock
  @Column({ default: false })
  @Index()
  locked: boolean;

  // failure attempt lock
  @Column({ type: 'datetime', precision: 6, default: () => 'CURRENT_TIMESTAMP' })
  @Index()
  lockedUntil: Date;

  // failure attempt count in a row
  @Column({ default: 0, type: 'tinyint' })
  failedCount: number;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;
}
