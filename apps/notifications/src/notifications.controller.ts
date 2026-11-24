import { Controller } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';

import { NotificationsService } from './notifications.service';

@Controller()
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  @EventPattern('order.created')
  async handleOrderCreated(
    @Payload()
    data: {
      orderId: number;
      userId: number;
      total: string;
    },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const message = context.getMessage();

    try {
      await this.notificationsService.sendOrderNotification(data);
      channel.ack(message);
    } catch (error) {
      // false, false → não recoloca na fila → vai para DLQ
      channel.nack(message, false, false);
      throw error;
    }
  }
}