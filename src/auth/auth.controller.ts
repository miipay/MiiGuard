import { Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { LocalAuthGuard } from '@src/shared/guards/local-auth.guard';
import { AccessTokenGuard } from '@src/shared/guards/access-token.guard';
import { RefreshTokenGuard } from '@src/shared/guards/refresh-token.guard';
import { BaseUser, IPermission, JWTTokens } from '@src/shared/interfaces';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Req() req: Request): Promise<JWTTokens> {
    return await this.authService.createTokens((req.user as BaseUser).username);
  }

  @UseGuards(AccessTokenGuard)
  @Get('/logout')
  @HttpCode(204)
  async logout(@Req() req: Request): Promise<void> {
    return await this.authService.logout((req.user as BaseUser).username);
  }

  @UseGuards(AccessTokenGuard)
  @Get('/me')
  getMe(@Req() req: Request): Record<'username' | 'displayName' | 'permissions', string | IPermission[]> {
    const { username, displayName, permissions } = req.user as BaseUser;
    return { username, displayName, permissions };
  }

  @UseGuards(RefreshTokenGuard)
  @Get('/refresh')
  async refreshTokens(@Req() req: Request): Promise<JWTTokens> {
    const baseUser = req.user as BaseUser;
    return this.authService.refreshTokens(baseUser.username, baseUser.refreshToken);
  }
}
