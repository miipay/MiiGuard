import { Strategy } from 'passport-local';
import { Request } from 'express';
import { PassportStrategy } from '@nestjs/passport';
import { ContextIdFactory, ModuleRef } from '@nestjs/core';
import { HttpException, Injectable, UnauthorizedException } from '@nestjs/common';

import { AuthService } from '../auth.service';
import { BaseUser } from '../interfaces';
import { LoginError, LoginErrorType } from 'src/users/users.error';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private moduleRef: ModuleRef) {
    super({ passReqToCallback: true });
  }

  async validate(request: Request, username: string, password: string): Promise<BaseUser> {
    const contextId = ContextIdFactory.getByRequest(request);
    // "AuthService" is a request-scoped provider
    const authService = await this.moduleRef.resolve(AuthService, contextId);
    try {
      return await authService.validateUser(username, password);
    } catch (ex) {
      if (ex instanceof LoginError) {
        if (ex.type === LoginErrorType.userLocked) {
          throw new HttpException('User locked', 423);
        }
      }
      throw new UnauthorizedException();
    }
  }
}
