import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Entities } from './entities';
import { PermissionsService } from './permissions.service';
import { UsersService } from './users.service';
import { PermissionsController } from './permissions.controller';
import { UsersController } from './users.controller';

@Module({
  controllers: [UsersController, PermissionsController],
  imports: [TypeOrmModule.forFeature(Entities)],
  providers: [UsersService, PermissionsService],
  exports: [UsersService, PermissionsService],
})
export class UsersModule {}
