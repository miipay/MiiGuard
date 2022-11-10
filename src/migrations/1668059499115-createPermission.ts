import { MigrationInterface, QueryRunner } from "typeorm";

export class createPermission1668059499115 implements MigrationInterface {
    name = 'createPermission1668059499115'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`permission\` (\`id\` int NOT NULL AUTO_INCREMENT, \`service\` varchar(160) NOT NULL, \`permission\` varchar(160) NOT NULL, \`created\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_e6565325161dbd4dadcd97e74c\` (\`service\`), UNIQUE INDEX \`IDX_98cffb543b93d73356f5d1268b\` (\`service\`, \`permission\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_permissions_permission\` (\`userUsername\` varchar(254) NOT NULL, \`permissionId\` int NOT NULL, INDEX \`IDX_1e9e759c8c979bf5c26e7729b6\` (\`userUsername\`), INDEX \`IDX_c43a6a56e3ef281cbfba9a7745\` (\`permissionId\`), PRIMARY KEY (\`userUsername\`, \`permissionId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`lockedUntil\` \`lockedUntil\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`user_permissions_permission\` ADD CONSTRAINT \`FK_1e9e759c8c979bf5c26e7729b68\` FOREIGN KEY (\`userUsername\`) REFERENCES \`user\`(\`username\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`user_permissions_permission\` ADD CONSTRAINT \`FK_c43a6a56e3ef281cbfba9a77457\` FOREIGN KEY (\`permissionId\`) REFERENCES \`permission\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_permissions_permission\` DROP FOREIGN KEY \`FK_c43a6a56e3ef281cbfba9a77457\``);
        await queryRunner.query(`ALTER TABLE \`user_permissions_permission\` DROP FOREIGN KEY \`FK_1e9e759c8c979bf5c26e7729b68\``);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`lockedUntil\` \`lockedUntil\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`DROP INDEX \`IDX_c43a6a56e3ef281cbfba9a7745\` ON \`user_permissions_permission\``);
        await queryRunner.query(`DROP INDEX \`IDX_1e9e759c8c979bf5c26e7729b6\` ON \`user_permissions_permission\``);
        await queryRunner.query(`DROP TABLE \`user_permissions_permission\``);
        await queryRunner.query(`DROP INDEX \`IDX_98cffb543b93d73356f5d1268b\` ON \`permission\``);
        await queryRunner.query(`DROP INDEX \`IDX_e6565325161dbd4dadcd97e74c\` ON \`permission\``);
        await queryRunner.query(`DROP TABLE \`permission\``);
    }

}
