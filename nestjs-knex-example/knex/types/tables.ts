declare module 'knex/types/tables' {
  interface Post {
    id: string;
    title: string;
    content: string;
  }

  interface Tables {
    posts: Post;
  }
}
