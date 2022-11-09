import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Entities } from './entities';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature(Entities)],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
