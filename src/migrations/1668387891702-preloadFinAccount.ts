import { MigrationInterface, QueryRunner } from 'typeorm';
import { preloadPermissions, unloadServicePermissions } from './utils/preloads';

const PERMISSIONS = [
  { service: 'FinAccount', permission: 'account.listOwned' },
  { service: 'FinAccount', permission: 'account.listAll' },
  { service: 'FinAccount', permission: 'account.create' },
  { service: 'FinAccount', permission: 'account.update' },
  { service: 'FinAccount', permission: 'account.delete' },
  { service: 'FinAccount', permission: 'account.enable' },
  { service: 'FinAccount', permission: 'account.withdrawDeposit' },
  { service: 'FinAccount', permission: 'account.transfer' },
  { service: 'FinAccount', permission: 'ledger.listOwned' },
  { service: 'FinAccount', permission: 'ledger.listAll' },
];

export class preloadFinAccount1668387891702 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await preloadPermissions(queryRunner, PERMISSIONS);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await unloadServicePermissions(
      queryRunner,
      PERMISSIONS[0].service,
      PERMISSIONS.map((perm) => perm.permission),
    );
  }
}
