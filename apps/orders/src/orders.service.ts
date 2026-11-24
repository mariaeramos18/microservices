import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { randomUUID } from 'node:crypto';

import { PrismaService } from './prisma.service';
import { CreateOrderDto, OrderCreatedEvent } from '@app/contracts';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,

    @Inject('USERS_SERVICE')
    private readonly usersClient: ClientProxy,

    @Inject('NOTIFICATIONS_CLIENT')
    private readonly notificationsClient: ClientProxy,
  ) {}

  async create(data: CreateOrderDto) {
    // 1. Consultar usuário (síncrono, TCP)
    const user = await firstValueFrom(
      this.usersClient.send('users.findOne', data.userId).pipe(timeout(3000)),
    );

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // 2. Pedido + evento Outbox na MESMA transação
    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId: data.userId,
          description: data.description,
          total: data.total,
        },
      });

      const event: OrderCreatedEvent = {
        eventId: randomUUID(),
        orderId: created.id,
        userId: created.userId,
        total: created.total.toString(),
        occurredAt: new Date().toISOString(),
      };

      await tx.outboxEvent.create({
        data: {
          id: event.eventId,
          eventType: 'order.created',
          payload: { ...event },
        },
      });

      return created;
    });

    return order;
  }

  findAll() {
    return this.prisma.order.findMany();
  }

  findOne(id: number) {
    return this.prisma.order.findUnique({ where: { id } });
  }
}