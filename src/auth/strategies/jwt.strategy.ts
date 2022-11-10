import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UsersService } from 'src/users/users.service';
import { JWTPayload, BaseUser } from 'src/shared/interfaces';

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private configService: ConfigService, private userService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKey: configService.getOrThrow('JWT_ACCESS_SECRET'),
    });
  }

  async validate(req: Request, payload: JWTPayload): Promise<BaseUser> {
    const accessToken = req.get('Authorization').replace('Bearer', '').trim();
    if (!(await this.userService.verifyAccessToken(payload.username, accessToken))) {
      throw new UnauthorizedException();
    }
    const user = await this.userService.findOneByKey(payload.username);
    if (!(await this.userService.isActive(user))) {
      throw new UnauthorizedException();
    } else {
      return user;
    }
  }
}
