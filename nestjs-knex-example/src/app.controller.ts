import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { Post as KPost } from 'knex/types/tables';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('posts')
  async getPosts(): Promise<KPost[]> {
    return this.appService.getPosts();
  }

  @Post('addPost')
  async addPost(): Promise<void> {
    return this.appService.addPost();
  }
}
