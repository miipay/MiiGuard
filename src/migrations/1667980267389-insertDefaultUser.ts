import { User } from '../users/entities';
import { hashPassword } from '../users/utils';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class insertDefaultUser1667980267389 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hashResult = await hashPassword('abcdef123456');
    const user = queryRunner.manager.create<User>(User, {
      username: 'admin',
      password: hashResult.passwordHash,
      displayName: 'Admin',
      hashAlgorithm: hashResult.algorithm,
    });
    await queryRunner.manager.save(user);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.delete<User>(User, { username: 'admin' });
  }
}
