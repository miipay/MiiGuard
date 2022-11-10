import { Reflector } from '@nestjs/core';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { PERMISSIONS_KEY } from '../decorators/permission.decorator';
import { BaseUser, IPermission } from '../interfaces';
import { hasPermissions } from '../utils';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPerms = this.reflector.getAllAndOverride<IPermission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredPerms) {
      return true;
    }
    const user = context.switchToHttp().getRequest().user as BaseUser;
    if (!user.permissions) {
      return false;
    }
    return hasPermissions(user, requiredPerms);
  }
}
