import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@src/app.module';
import { JWTTokens } from '@src/shared/interfaces';
import { User } from '@src/users/entities';
import { createTestAdmin, lockUser, LoginAccount } from '../users.utils';

describe('UsersController (e2e)', () => {
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
      username: `testUsersControllerAdmin${new Date().getTime()}`,
      password: '1234567890',
    });
    const jwtTokens: JWTTokens = (await request(app.getHttpServer()).post('/auth/login').send(testAdmin).expect(201))
      .body as JWTTokens;
    adminAccessToken = jwtTokens.accessToken;
    adminRefreshToken = jwtTokens.refreshToken;
  });

  it('/users (GET) no token -> 401', () => {
    return request(app.getHttpServer()).get('/users').expect(401);
  });

  it('/users (GET) admin session token -> 200', async () => {
    const payload = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);
    expect(payload.body.meta.totalItems).toBeGreaterThan(0);
  });

  it('/users (GET) admin refresh token -> 401', async () => {
    await request(app.getHttpServer()).get('/users').set('Authorization', `Bearer ${adminRefreshToken}`).expect(401);
  });

  it('/users/admin (GET) admin session token -> 200', async () => {
    const payload = await request(app.getHttpServer())
      .get(`/users/${testAdmin.username}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);
    expect(payload.body.username).toEqual(testAdmin.username);
  });

  it('/users/admin (GET) no session token -> 401', async () => {
    await request(app.getHttpServer()).get(`/users/${testAdmin.username}`).expect(401);
  });

  it('/users/inexist (GET) admin session token -> 404', async () => {
    await request(app.getHttpServer())
      .get('/users/inexist')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(404);
  });

  it('/users/inexist/admin (GET) admin session token -> 404', async () => {
    await request(app.getHttpServer())
      .get(`/users/inexist/admin`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(404);
  });

  describe('Create users', () => {
    const usernameForTest = `testcaseuser${new Date().getTime()}`;
    it('/users (POST) admin session token -> 200', async () => {
      const resp = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          username: usernameForTest,
          password: '1234567890',
          displayName: 'TestCase',
          locked: true,
        })
        .expect(201);
      expect(resp.body.username).toEqual(usernameForTest);
      expect(resp.body.displayName).toEqual('TestCase');
      expect(resp.body.locked).toEqual(true);
    });

    it('/users (POST) min payload, admin session token -> 200', async () => {
      const resp = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          username: usernameForTest + 2,
          password: '1234567890',
          displayName: 'TestCase2',
        })
        .expect(201);
      expect(resp.body.username).toEqual(usernameForTest + 2);
      expect(resp.body.displayName).toEqual('TestCase2');
      expect(resp.body.locked).toEqual(false);
    });

    it('/users (POST) duplicated admin session token -> 409', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          username: usernameForTest,
          password: '1234567890',
          displayName: 'TestCase',
          locked: true,
        })
        .expect(409);
    });

    it('/users (POST) wrong payload, admin session token -> 400', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ displayName: 'TestCase2' })
        .expect(400);
    });

    it('/users (POST) validation error, admin session token -> 400', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          username: 'testcas.euser2',
          password: '1234567890',
          displayName: 'TestCase2',
        })
        .expect(400);
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          username: 'testcas-euser2',
          password: '1234567890',
          displayName: 'TestCase2',
        })
        .expect(400);
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          username: 'testcas euser2',
          password: '1234567890',
          displayName: 'TestCase2',
        })
        .expect(400);
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          username: 'testcas#euser2',
          password: '1234567890',
          displayName: 'TestCase2',
        })
        .expect(400);
    });
  });

  describe('Modify users', () => {
    const MODIFY_USER = {
      username: 'ModifyUser',
      password: '1234567890',
      displayName: 'ModifyUser',
    };
    let targetUser: User;
    beforeAll(async () => {
      MODIFY_USER.username = MODIFY_USER.username + new Date().getTime();
      const resp = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(MODIFY_USER)
        .expect(201);
      targetUser = resp.body as User;
    });

    it('/users/:username/lock (PATCH) admin session token -> 200', async () => {
      expect(targetUser.locked).toEqual(false);
      targetUser = await lockUser(app, targetUser.username, adminAccessToken, true);
    });

    it('/users/:username/displayName (PATCH) admin session token -> 200', async () => {
      expect(targetUser.displayName).toEqual(MODIFY_USER.displayName);
      targetUser = (
        await request(app.getHttpServer())
          .patch(`/users/${targetUser.username}/displayName`)
          .set('Authorization', `Bearer ${adminAccessToken}`)
          .send({ displayName: 'renamed' })
          .expect(200)
      ).body;
      expect(targetUser.displayName).toEqual('renamed');
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
