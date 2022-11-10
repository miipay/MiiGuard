export const MAXIMUM_FAILURE_COUNT = 5;
export const LOCK_DURATION = 3 * 60 * 1000; // 3 mins
export const PERMISSIONS = {
  UserList: { service: 'MiiGuard', permission: 'user.list' },
  UserCreate: { service: 'MiiGuard', permission: 'user.create' },
  UserUpdate: { service: 'MiiGuard', permission: 'user.update' },
  PermissionList: { service: 'MiiGuard', permission: 'permission.list' },
  PermissionCreate: { service: 'MiiGuard', permission: 'permission.create' },
  PermissionDelete: { service: 'MiiGuard', permission: 'permission.delete' },
};
