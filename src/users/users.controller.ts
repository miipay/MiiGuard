import { Body, Controller, Get, HttpCode, NotFoundException, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { Permissions } from '@src/shared/decorators/permission.decorator';
import { AccessTokenGuard } from '@src/shared/guards/access-token.guard';
import { PermissionsGuard } from '@src/shared/guards/permission.guard';
import { User } from './entities';
import { UsersService } from './users.service';
import { PERMISSIONS } from './constants';
import { CreateUserDto, LockUserDto, PermissionsDto, RenameUserDto } from './users.dto';
import { QueryFailedError } from 'typeorm';
import { ConflictException } from '@nestjs/common';

@Controller('users')
@UseGuards(AccessTokenGuard, PermissionsGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}
  @Get()
  @Permissions(PERMISSIONS.UserList)
  async findAll(@Paginate() query: PaginateQuery): Promise<Paginated<User>> {
    return await this.usersService.findAll(query);
  }

  @Get('/:username')
  @Permissions(PERMISSIONS.UserList)
  async getUser(@Param('username') username: string): Promise<User> {
    const user = await this.usersService.findOneByKey(username);
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }

  @Post()
  @HttpCode(201)
  @Permissions(PERMISSIONS.UserCreate)
  async createUser(@Body() userDto: CreateUserDto): Promise<User> {
    try {
      return await this.usersService.createUser(userDto);
    } catch (ex) {
      if (ex instanceof QueryFailedError) {
        if ((ex as QueryFailedError).driverError.code === 'ER_DUP_ENTRY') {
          throw new ConflictException(`duplicated user ${userDto.username}`);
        }
      }
      throw ex;
    }
  }

  @Patch('/:username/lock')
  @Permissions(PERMISSIONS.UserUpdate)
  async lockUser(@Param('username') username: string, @Body() lockUser: LockUserDto): Promise<User> {
    await this.usersService.lockUser(username, lockUser.locked);
    return await this.usersService.findOneByKey(username);
  }

  @UseGuards(AccessTokenGuard)
  @Patch('/:username/displayName')
  @Permissions(PERMISSIONS.UserUpdate)
  async rename(@Param('username') username: string, @Body() rename: RenameUserDto): Promise<User> {
    await this.usersService.updateDisplayName(username, rename.displayName);
    return await this.usersService.findOneByKey(username);
  }

  @Patch('/:username/permissions')
  @Permissions(PERMISSIONS.UserUpdate)
  async setPermissions(@Param('username') username: string, @Body() permissions: PermissionsDto): Promise<User> {
    return await this.usersService.setPermissions(username, permissions.permissions);
  }
}
