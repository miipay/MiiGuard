import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { Permissions } from '@src/shared/decorators/permission.decorator';
import { AccessTokenGuard } from '@src/shared/guards/accessToken.guard';
import { PermissionsGuard } from '@src/shared/guards/permission.guard';
import { Permission } from './entities';
import { PERMISSIONS } from './constants';
import { PermissionDto } from './users.dto';
import { PermissionsService } from './permissions.service';

@Controller('permissions')
@UseGuards(AccessTokenGuard, PermissionsGuard)
export class PermissionsController {
  constructor(private permissionsService: PermissionsService) {}
  @Get()
  @Permissions(PERMISSIONS.PermissionList)
  async findAll(@Paginate() query: PaginateQuery): Promise<Paginated<Permission>> {
    return await this.permissionsService.findAll(query);
  }

  @Post()
  @HttpCode(201)
  @Permissions(PERMISSIONS.PermissionCreate)
  async createPermission(@Body() permDto: PermissionDto): Promise<Permission> {
    return await this.permissionsService.createPermission(permDto.service, permDto.permission);
  }

  @Delete('/:id')
  @HttpCode(204)
  @Permissions(PERMISSIONS.PermissionDelete)
  async deletePermission(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.permissionsService.deletePermissionById(id);
  }
}
