import * as path from 'path';
import * as dotenv from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenv.config();

export const getTypeOrmModuleOptions = (entities?: string[] | any[]): DataSourceOptions => {
  const baseOptions = {
    synchronize: false,
    autoLoadEntities: true,
    timezone: 'Z',
    entities: entities || [path.join(__dirname, '../**/*.entity.{js,ts}')],
  };

  switch (process.env.NODE_ENV) {
    case 'test':
      return { ...baseOptions, type: 'sqlite', database: 'test.sqlite' };
    case 'production':
    default:
      return {
        ...baseOptions,
        type: 'mariadb',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT) || 3306,
        database: process.env.DB_DATABASE,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
      };
  }
};

export const getDataSourceOptions = (): DataSourceOptions => {
  const options: DataSourceOptions = {
    ...getTypeOrmModuleOptions(),
  } as DataSourceOptions;

  Object.assign(options, {
    migrationsTableName: 'db_migrations',
    migrations: ['./src/migrations/*.ts'],
    cli: {
      migrationsDir: 'src/migrations',
    },
  } as Partial<DataSourceOptions>);
  return options;
};

export default new DataSource(getDataSourceOptions());
