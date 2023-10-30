import { Inject, Injectable } from '@nestjs/common';
import knex, { Knex } from 'knex';
import { KNEX_CONFIG } from './knex.module-definition';

@Injectable()
export class KnexService {
  readonly knex: Knex;

  constructor(@Inject(KNEX_CONFIG) config) {
    this.knex = knex(config);
  }
}
