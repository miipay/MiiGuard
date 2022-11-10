import { BaseUser, IPermission } from './interfaces';

export const hasPermission = (user: BaseUser, permission: IPermission): boolean => {
  if (!user.permissions) {
    return false;
  }
  return !!user.permissions.find(
    (userPerm) => userPerm.permission === permission.permission && userPerm.service === permission.service,
  );
};

export const hasPermissions = (user: BaseUser, permissions: IPermission[]): boolean => {
  return permissions.every((perm) => hasPermission(user, perm));
};
