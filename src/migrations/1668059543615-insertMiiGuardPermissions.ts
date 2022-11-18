import { MigrationInterface, QueryRunner, In } from 'typeorm';
import { Permission, User } from '../users/entities';
import { preloadPermissions, unloadServicePermissions } from './utils/preloads';

const PERMISSIONS = [
  { service: 'MiiGuard', permission: 'permission.list' },
  { service: 'MiiGuard', permission: 'permission.create' },
  { service: 'MiiGuard', permission: 'permission.delete' },
  { service: 'MiiGuard', permission: 'user.list' },
  { service: 'MiiGuard', permission: 'user.create' },
  { service: 'MiiGuard', permission: 'user.update' },
];

export class insertMiiGuardPermissions1668059543615 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await preloadPermissions(queryRunner, PERMISSIONS);

    const perms = await queryRunner.manager.findBy<Permission>(Permission, {
      service: PERMISSIONS[0].service,
      permission: In(PERMISSIONS.map((perm) => perm.permission)),
    });
    const admin = await queryRunner.manager.getRepository(User).findOne({
      where: { username: 'admin' },
      relations: ['permissions'],
    });
    const newPerms = perms.filter(
      (newPerm) =>
        !admin.permissions.find(
          (userPerm) => userPerm.service === newPerm.service && userPerm.permission === newPerm.permission,
        ),
    );
    admin.permissions = [...admin.permissions, ...newPerms];
    await queryRunner.manager.save(admin);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await unloadServicePermissions(
      queryRunner,
      PERMISSIONS[0].service,
      PERMISSIONS.map((perm) => perm.permission),
    );
  }
}
