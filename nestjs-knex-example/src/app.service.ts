import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { KnexService } from './knex/knex.service';
import { Post } from 'knex/types/tables';

@Injectable()
export class AppService {
  constructor(private readonly knexService: KnexService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getPosts(): Promise<Post[]> {
    return await this.knexService.knex('post').select().from<Post>('posts');
  }

  async addPost(): Promise<void> {
    await this.knexService
      .knex<Post>('post')
      .insert({
        title: `Awewome Title`,
        content: 'Lorem Ipsum',
      })
      .catch((error) => {
        throw new InternalServerErrorException(error);
      });
  }
}
