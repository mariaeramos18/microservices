import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/orders/schema.prisma',
  migrations: {
    path: 'prisma/orders/migrations',
  },
  datasource: {
    url: env('ORDERS_DATABASE_URL'),
  },
});