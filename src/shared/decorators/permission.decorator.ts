import { SetMetadata } from '@nestjs/common';
import { IPermission } from '../interfaces';

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: IPermission[]) => SetMetadata(PERMISSIONS_KEY, permissions);
