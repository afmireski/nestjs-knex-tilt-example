import { Global, Module } from '@nestjs/common';
import { KnexService } from './knex.service';
import {
  KNEX_CONFIG,
  KNEX_OPTIONS,
  KnexModuleClass,
} from './knex.module-definition';
import { Knex } from 'knex';

@Global()
@Module({
  providers: [
    KnexService,
    {
      provide: KNEX_CONFIG,
      inject: [KNEX_OPTIONS],
      useFactory: (config: Knex.Config) => config,
    },
  ],
  exports: [KnexService],
})
export class KnexModule extends KnexModuleClass {}
