import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@src/users/users.service';
import { User } from '@src/users/entities';
import { JWTPayload, JWTTokens } from '@src/shared/interfaces';
import { ACCESS_TOKEN_LIFE_TIME, REFRESH_TOKEN_LIFE_TIME } from './constants';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(username: string, password: string): Promise<User> {
    await this.usersService.verifyLogin(username, password);
    return await this.usersService.findOneByKey(username);
  }

  async logout(username: string) {
    return this.usersService.logout(username);
  }

  async refreshTokens(username: string, refreshToken: string): Promise<JWTTokens> {
    if (!(await this.usersService.verifyRefreshToken(username, refreshToken))) {
      throw new ForbiddenException('Access Denied');
    }
    return this.createTokens(username);
  }

  async createTokens(username: string): Promise<JWTTokens> {
    // Query user for update the permissions. Two use cases of this method:
    // 1. to create access token when a user logged in
    // 2. to update the access token when a user uses the refresh token to update tokens
    // For the first case, we could use the User entity to obtain the permission. But the permission may be changed at
    // the second use cases.
    const user = await this.usersService.findOneByKey(username);
    if (!user) {
      throw new BadRequestException();
    }
    const payload: JWTPayload = {
      username: username,
      sub: username,
      iss: 'MiiGuard',
      iat: new Date().getTime(),
      permissions: user.permissions,
    };
    const tokens = {
      accessToken: this.jwtService.sign(payload, {
        secret: this.configService.getOrThrow('JWT_ACCESS_SECRET'),
        expiresIn: ACCESS_TOKEN_LIFE_TIME,
      }),
      refreshToken: this.jwtService.sign(payload, {
        secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
        expiresIn: REFRESH_TOKEN_LIFE_TIME,
      }),
    };
    await this.usersService.updateTokens(username, tokens.accessToken, tokens.refreshToken);
    return tokens;
  }
}
