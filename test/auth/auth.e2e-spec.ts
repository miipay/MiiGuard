import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@src/app.module';
import { JWTTokens } from '@src/shared/interfaces';
import { User } from '@src/users/entities';
import { MAXIMUM_FAILURE_COUNT } from '@src/users/constants';
import { createTestAdmin, lockUser, LoginAccount } from '../users.utils';

const checkMe = async (app: INestApplication, token: string, expectCode: number, username: string): Promise<void> => {
  const payload: User = (
    await request(app.getHttpServer()).get('/auth/me').set('Authorization', `Bearer ${token}`).expect(expectCode)
  ).body as User;
  if (expectCode === 200) {
    expect(payload).toBeDefined();
    expect(payload.username).toEqual(username);
    expect(payload.permissions.length).toBeGreaterThan(0);
  }
};

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let testAdmin: LoginAccount;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    testAdmin = await createTestAdmin(app, {
      username: `testAuthControllerAdmin${new Date().getTime()}`,
      password: '1234567890',
    });
  });

  it('/auth/login (POST) login test admin with nothing-> 401', () => {
    return request(app.getHttpServer()).post('/auth/login').expect(401);
  });

  it('/auth/login (POST) login test admin -> 201', async () => {
    await request(app.getHttpServer()).post('/auth/login').send(testAdmin).expect(201);
  });

  describe('Tokens', () => {
    let adminAccessToken: string;
    let adminRefreshToken: string;

    beforeEach(async () => {
      const jwtTokens: JWTTokens = (await request(app.getHttpServer()).post('/auth/login').send(testAdmin).expect(201))
        .body as JWTTokens;
      adminAccessToken = jwtTokens.accessToken;
      adminRefreshToken = jwtTokens.refreshToken;
    });

    it('/auth/me (GET) without token-> 401', async () => {
      await request(app.getHttpServer()).get('/auth/me').expect(401);
    });

    it('/auth/me (GET) with access token-> 200', async () => {
      await checkMe(app, adminAccessToken, 200, testAdmin.username);
    });

    it('/auth/me (GET) with refresh token-> 401', async () => {
      await checkMe(app, adminRefreshToken, 401, testAdmin.username);
    });

    it('/auth/login (POST) twice to invalidate first token -> 200', async () => {
      const secondTokens: JWTTokens = (
        await request(app.getHttpServer()).post('/auth/login').send(testAdmin).expect(201)
      ).body as JWTTokens;
      await checkMe(app, secondTokens.accessToken, 200, testAdmin.username);
      await checkMe(app, adminAccessToken, 401, testAdmin.username);
    });

    it('/auth/refresh (GET) refresh token to invalidate the first token -> 200', async () => {
      const secondTokens: JWTTokens = (
        await request(app.getHttpServer())
          .get('/auth/refresh')
          .set('Authorization', `Bearer ${adminRefreshToken}`)
          .expect(200)
      ).body as JWTTokens;
      await checkMe(app, secondTokens.accessToken, 200, testAdmin.username);
      await checkMe(app, adminAccessToken, 401, testAdmin.username);
    });

    it('/auth/refresh (GET) refresh token with access token -> 401', async () => {
      await request(app.getHttpServer())
        .get('/auth/refresh')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(401);
    });

    it('/auth/logout (GET) logout to invalidate the first token -> 204', async () => {
      await request(app.getHttpServer())
        .get('/auth/logout')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(204);
      await checkMe(app, adminAccessToken, 401, testAdmin.username);
    });
  });

  describe('Lock and Login', () => {
    let adminAccessToken: string;
    let testUserLogin: LoginAccount;

    beforeEach(async () => {
      testUserLogin = await createTestAdmin(app, {
        username: `testLockAuthLogin${new Date().getTime()}`,
        password: '1234567890',
      });

      const jwtTokens: JWTTokens = (await request(app.getHttpServer()).post('/auth/login').send(testAdmin).expect(201))
        .body as JWTTokens;
      adminAccessToken = jwtTokens.accessToken;
    });

    it('/auth/login (POST) with a locked user -> 401', async () => {
      await lockUser(app, testUserLogin.username, adminAccessToken, true);
      await request(app.getHttpServer()).post('/auth/login').send(testUserLogin).expect(423);
    });

    it('/auth/login (POST) auto lock with N errors -> 423', async () => {
      for (let i = 0; i < MAXIMUM_FAILURE_COUNT; i++) {
        await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            username: testUserLogin.username,
            password: 'wrong password',
          })
          .expect(401);
      }
      await request(app.getHttpServer()).post('/auth/login').send(testUserLogin).expect(423);
    });

    it('/auth/login (POST) invalidate token with user locked -> 401', async () => {
      const jwtTokens: JWTTokens = (
        await request(app.getHttpServer()).post('/auth/login').send(testUserLogin).expect(201)
      ).body as JWTTokens;
      await checkMe(app, jwtTokens.accessToken, 200, testUserLogin.username);
      await lockUser(app, testUserLogin.username, adminAccessToken, true);
      await checkMe(app, jwtTokens.accessToken, 401, testUserLogin.username);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
