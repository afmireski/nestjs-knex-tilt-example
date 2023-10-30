import { ConfigService } from '@nestjs/config';
import type { Knex } from 'knex';
import { config } from 'dotenv';

// Update with your config settings.

config();

const configService = new ConfigService();

const knexConfig: { [key: string]: Knex.Config } = {
  development: {
    client: 'mysql2',
    connection: configService.get('DATABASE_URL'),
    migrations: {
      directory: './knex/migrations',
      extension: 'ts',
      tableName: 'knex_migrations',
    },
  },
};

module.exports = knexConfig;
export default knexConfig;
