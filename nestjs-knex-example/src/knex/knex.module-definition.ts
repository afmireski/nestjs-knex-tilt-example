import { ConfigurableModuleBuilder } from '@nestjs/common';
import { Knex } from 'knex';

export const KNEX_CONFIG = 'KNEX_CONFIG';

// Define métodos customizados para o módulo
export const {
  ConfigurableModuleClass: KnexModuleClass,
  MODULE_OPTIONS_TOKEN: KNEX_OPTIONS,
} = new ConfigurableModuleBuilder<Knex.Config>()
  .setClassMethodName('forRoot')
  .build();
