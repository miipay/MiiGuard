import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities';
import { JWTPayload, JWTTokens } from './interfaces';

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
    const payload: JWTPayload = {
      username: username,
      sub: username,
      iss: 'MiiGuard',
    };
    const tokens = {
      accessToken: this.jwtService.sign(payload, {
        secret: this.configService.getOrThrow('JWT_ACCESS_SECRET'),
        expiresIn: '15m',
      }),
      refreshToken: this.jwtService.sign(payload, {
        secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    };
    await this.usersService.updateTokens(username, tokens.accessToken, tokens.refreshToken);
    return tokens;
  }
}
