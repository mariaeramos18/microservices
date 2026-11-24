import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { NotificationsModule } from './notifications.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    NotificationsModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL!],
        queue: 'notifications_queue',
        queueOptions: {
          durable: true,
        },
        noAck: false,       // ACK manual
        prefetchCount: 1,
      },
    },
  );

  await app.listen();
}

bootstrap();