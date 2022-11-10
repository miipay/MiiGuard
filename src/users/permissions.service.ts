import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterOperator, PaginateQuery, paginate, Paginated } from 'nestjs-paginate';
import { Repository } from 'typeorm';
import { Permission } from './entities';

@Injectable()
export class PermissionsService {
  constructor(@InjectRepository(Permission) private permissionRepository: Repository<Permission>) {}

  async createPermission(service: string, permission: string): Promise<Permission> {
    const entity = this.permissionRepository.create({ service, permission });
    await this.permissionRepository.createQueryBuilder().insert().into(Permission).values(entity).orIgnore().execute();
    return await this.permissionRepository.findOneBy({ service, permission });
  }

  async findAll(query: PaginateQuery): Promise<Paginated<Permission>> {
    return paginate(query, this.permissionRepository, {
      sortableColumns: ['service', 'permission'],
      defaultSortBy: [
        ['service', 'ASC'],
        ['service', 'ASC'],
      ],
      filterableColumns: {
        service: [FilterOperator.EQ],
      },
    });
  }

  async deletePermission(service: string, permission: string): Promise<void> {
    await this.permissionRepository.delete({ service, permission });
  }
}
