import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@src/app.module';
import { IPermission, JWTTokens } from '@src/shared/interfaces';
import { Permission, User } from '@src/users/entities';
import { createTestAdmin, LoginAccount } from '../users.utils';

describe('PermissionsController (e2e)', () => {
  let app: INestApplication;
  let testAdmin: LoginAccount;
  let adminAccessToken: string;
  let adminRefreshToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    testAdmin = await createTestAdmin(app, {
      username: `testPermissionsControllerAdmin${new Date().getTime()}`,
      password: '1234567890',
    });
    const jwtTokens: JWTTokens = (await request(app.getHttpServer()).post('/auth/login').send(testAdmin).expect(201))
      .body as JWTTokens;
    adminAccessToken = jwtTokens.accessToken;
    adminRefreshToken = jwtTokens.refreshToken;
  });

  it('/permissions (GET) no token -> 401', () => {
    return request(app.getHttpServer()).get('/permissions').expect(401);
  });

  it('/permissions (GET) admin session token -> 200', async () => {
    const payload = await request(app.getHttpServer())
      .get('/permissions')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);
    expect(payload.body.meta.totalItems).toBeGreaterThan(0);
  });

  it('/permissions (GET) admin refresh token -> 401', async () => {
    await request(app.getHttpServer())
      .get('/permissions')
      .set('Authorization', `Bearer ${adminRefreshToken}`)
      .expect(401);
  });

  describe('Create permissions', () => {
    it('/permissions (POST) admin session token -> 201', async () => {
      const payload = await request(app.getHttpServer())
        .post('/permissions')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          service: 'testcase',
          permission: 'read',
        })
        .expect(201);
      expect(payload.body.service).toEqual('testcase');
      expect(payload.body.permission).toEqual('read');
    });

    it('/permissions (POST) duplicated admin session token -> 201', async () => {
      const payload = await request(app.getHttpServer())
        .post('/permissions')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          service: 'testcase',
          permission: 'read',
        })
        .expect(201);
      expect(payload.body.service).toEqual('testcase');
      expect(payload.body.permission).toEqual('read');
      const permissions = (
        await request(app.getHttpServer())
          .get('/permissions')
          .set('Authorization', `Bearer ${adminAccessToken}`)
          .expect(200)
      ).body;
      const filtered = (permissions.data as IPermission[]).filter(
        (perm) => perm.service === 'testcase' && perm.permission === 'read',
      );
      expect(filtered.length).toEqual(1);
    });

    it('/permissions (POST) wrong payload admin session token -> 400', async () => {
      await request(app.getHttpServer())
        .post('/permissions')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ service: 'testcase' })
        .expect(400);
      await request(app.getHttpServer())
        .post('/permissions')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ permission: 'xyz' })
        .expect(400);
    });

    describe('Assign permission', () => {
      const BASE_USER = {
        username: 'AssignPermissionUser',
        password: '1234567890',
        displayName: 'AssignPermissionUser',
      };
      let targetUser: User;
      beforeEach(async () => {
        BASE_USER.username = BASE_USER.username + new Date().getTime();
        const resp = await request(app.getHttpServer())
          .post('/users')
          .set('Authorization', `Bearer ${adminAccessToken}`)
          .send(BASE_USER)
          .expect(201);
        targetUser = resp.body as User;
      });

      it('set, dedupe and remove inexist permissions', async () => {
        const resp = await request(app.getHttpServer())
          .patch(`/users/${targetUser.username}/permissions`)
          .set('Authorization', `Bearer ${adminAccessToken}`)
          .send({
            permissions: [
              {
                service: 'testcase',
                permission: 'read',
              },
              {
                service: 'testcase',
                permission: 'read',
              },
              {
                service: 'dummy',
                permission: 'xyz',
              },
            ],
          })
          .expect(200);
        expect(resp.body.permissions.length).toEqual(1);
        expect(resp.body.permissions[0].service).toEqual('testcase');
        expect(resp.body.permissions[0].permission).toEqual('read');
      });
    });
  });

  describe('Delete permissions', () => {
    let targetPerm: Permission;
    beforeEach(async () => {
      const resp = await request(app.getHttpServer())
        .post('/permissions')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          service: 'testcase',
          permission: `${new Date().getTime()}`,
        })
        .expect(201);
      targetPerm = resp.body as Permission;
    });

    it('/permissions (DELETE) admin session token -> 200', async () => {
      await request(app.getHttpServer())
        .delete(`/permissions/${targetPerm.id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(204);
      // try double delete
      await request(app.getHttpServer())
        .delete(`/permissions/${targetPerm.id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(204);
    });

    it('delete a permission that is assigned to user -> 200', async () => {
      const BASE_USER = {
        username: `deletePermissionUser${new Date().getTime()}`,
        password: '1234567890',
        displayName: 'deletePermissionUser',
      };
      const resp = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(BASE_USER)
        .expect(201);
      let targetUser = resp.body as User;
      await request(app.getHttpServer())
        .patch(`/users/${targetUser.username}/permissions`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ permissions: [targetPerm] })
        .expect(200);
      await request(app.getHttpServer())
        .delete(`/permissions/${targetPerm.id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(204);
      targetUser = (
        await request(app.getHttpServer())
          .get(`/users/${BASE_USER.username}`)
          .set('Authorization', `Bearer ${adminAccessToken}`)
          .expect(200)
      ).body as User;
      expect(targetUser.permissions.length).toEqual(0);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
