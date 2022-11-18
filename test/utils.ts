import { INestApplication } from '@nestjs/common';
import { UsersService } from '@src/users/users.service';
import { PERMISSIONS } from '@src/users/constants';

export type LoginAccount = {
  username: string;
  password: string;
};

export const createTestAdmin = async (app: INestApplication, login: LoginAccount): Promise<LoginAccount> => {
  const usersService = app.get<UsersService>(UsersService);
  await usersService.createUser({
    ...login,
    displayName: 'testAdmin',
  });
  const permissions = Object.keys(PERMISSIONS).map((key) => PERMISSIONS[key]);
  await usersService.setPermissions(login.username, permissions);
  return login;
};
