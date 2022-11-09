import { Entity, CreateDateColumn, Column, Index, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity()
@Index(['username', 'accessTokenHash'])
@Index(['username', 'refreshTokenHash'])
export class SessionToken {
  // set length to 254 to be email address compatible, https://www.rfc-editor.org/errata_search.php?rfc=3696
  @PrimaryColumn({ length: 254 })
  username: string;

  // valid assess token in SHA-512 hash
  @Column({ length: 128 })
  accessTokenHash: string;

  // valid refresh token in SHA-512 hash
  @Column({ length: 128 })
  refreshTokenHash: string;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;
}
