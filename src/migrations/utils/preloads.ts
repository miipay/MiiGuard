import { QueryRunner, In } from 'typeorm';
import { Permission } from '../../users/entities';
import { IPermission } from '../../shared/interfaces';

export const preloadPermissions = async (queryRunner: QueryRunner, permissions: IPermission[]) => {
  for (const permission of permissions) {
    await queryRunner.manager
      .createQueryBuilder<Permission>(Permission, 'permission')
      .insert()
      .values(permission)
      .orIgnore()
      .execute();
  }
};

export const unloadServicePermissions = async (queryRunner: QueryRunner, service: string, permissions: string[]) => {
  await queryRunner.manager.delete<Permission>(Permission, {
    service,
    permission: In(permissions),
  });
};

export const unloadPermissions = async (queryRunner: QueryRunner, permissions: IPermission[]) => {
  for (const permission of permissions) {
    await queryRunner.manager.delete<Permission>(Permission, permission);
  }
};
