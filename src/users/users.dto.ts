import { IsString, IsBoolean, IsOptional, IsNotEmpty, IsDate } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
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
