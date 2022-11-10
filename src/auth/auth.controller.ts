import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { LocalAuthGuard } from 'src/shared/guards/local-auth.guard';
import { AccessTokenGuard } from 'src/shared/guards/access-token.guard';
import { RefreshTokenGuard } from 'src/shared/guards/refresh-token.guard';
import { BaseUser } from 'src/shared/interfaces';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Req() req: Request) {
    return this.authService.createTokens((req.user as BaseUser).username);
  }

  @UseGuards(AccessTokenGuard)
  @Get('/logout')
  async logout(@Req() req: Request) {
    return this.authService.logout((req.user as BaseUser).username);
  }

  @UseGuards(AccessTokenGuard)
  @Get('/me')
  getMe(@Req() req: Request) {
    return (req.user as BaseUser).username;
  }

  @UseGuards(RefreshTokenGuard)
  @Get('/refresh')
  refreshTokens(@Req() req: Request) {
    const baseUser = req.user as BaseUser;
    return this.authService.refreshTokens(baseUser.username, baseUser.refreshToken);
  }
}
