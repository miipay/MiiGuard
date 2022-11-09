import { MigrationInterface, QueryRunner } from "typeorm";

export class createUsers1667980260252 implements MigrationInterface {
    name = 'createUsers1667980260252'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`session_token\` (\`username\` varchar(254) NOT NULL, \`accessTokenHash\` varchar(128) NOT NULL, \`refreshTokenHash\` varchar(128) NOT NULL, \`created\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`IDX_d392da269bae1aa31bae552c4d\` (\`username\`, \`refreshTokenHash\`), INDEX \`IDX_ac4bc6561e10d0f3772dbc0a42\` (\`username\`, \`accessTokenHash\`), PRIMARY KEY (\`username\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user\` (\`username\` varchar(254) NOT NULL, \`password\` varchar(256) NOT NULL, \`hashAlgorithm\` varchar(64) NOT NULL, \`displayName\` varchar(160) NOT NULL, \`locked\` tinyint NOT NULL DEFAULT 0, \`lockedUntil\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(), \`failedCount\` tinyint NOT NULL DEFAULT '0', \`created\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`IDX_bb3b13a3701d9359d926784409\` (\`locked\`), INDEX \`IDX_16d0c1a04ac7b10700b81b3b9a\` (\`lockedUntil\`), PRIMARY KEY (\`username\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_16d0c1a04ac7b10700b81b3b9a\` ON \`user\``);
        await queryRunner.query(`DROP INDEX \`IDX_bb3b13a3701d9359d926784409\` ON \`user\``);
        await queryRunner.query(`DROP TABLE \`user\``);
        await queryRunner.query(`DROP INDEX \`IDX_ac4bc6561e10d0f3772dbc0a42\` ON \`session_token\``);
        await queryRunner.query(`DROP INDEX \`IDX_d392da269bae1aa31bae552c4d\` ON \`session_token\``);
        await queryRunner.query(`DROP TABLE \`session_token\``);
    }

}
