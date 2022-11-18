import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UsersService } from '@src/users/users.service';
import { PERMISSIONS } from '@src/users/constants';
import { User } from '@src/users/entities';

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

export const lockUser = async (
  app: INestApplication,
  username: string,
  accessToken: string,
  locked: boolean,
): Promise<User> => {
  const user = (
    await request(app.getHttpServer())
      .patch(`/users/${username}/lock`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ locked })
      .expect(200)
  ).body as User;
  expect(user.locked).toEqual(locked);
  return user;
};
