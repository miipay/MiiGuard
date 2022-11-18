import { Type } from 'class-transformer';
import {
  IsAlphanumeric,
  IsString,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
  IsDate,
  IsDefined,
  ValidateNested,
  IsArray,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsAlphanumeric()
  username: string;
  @IsNotEmpty()
  @IsString()
  password: string;
  @IsNotEmpty()
  @IsString()
  displayName: string;
  @IsBoolean()
  @IsOptional()
  locked?: boolean;
  @IsDate()
  @IsOptional()
  lockUntil?: Date;
}

export class LockUserDto {
  @IsBoolean()
  locked: boolean;
}

export class RenameUserDto {
  @IsNotEmpty()
  @IsString()
  displayName: string;
}

export class PermissionDto {
  @IsNotEmpty()
  @IsString()
  service: string;
  @IsNotEmpty()
  @IsString()
  permission: string;
}

export class PermissionsDto {
  @IsArray()
  @IsNotEmpty()
  @IsDefined()
  @ValidateNested({ each: true })
  @Type(() => PermissionDto)
  permissions: PermissionDto[];
}
