import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UsersService } from 'src/users/users.service';
import { JWTPayload, BaseUser } from '../interfaces';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private configService: ConfigService, private userService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JWTPayload): Promise<BaseUser> {
    const refreshToken = req.get('Authorization').replace('Bearer', '').trim();
    if (!(await this.userService.verifyRefreshToken(payload.username, refreshToken))) {
      throw new UnauthorizedException();
    }
    const user = await this.userService.findOneByKey(payload.username);
    if (!(await this.userService.isActive(user))) {
      throw new UnauthorizedException();
    } else {
      return { ...user, refreshToken };
    }
  }
}
