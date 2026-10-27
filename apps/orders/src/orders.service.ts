import {
  BadRequestException,
  Inject,
  Injectable,
} from '@nestjs/common';

import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

import { PrismaService } from './prisma.service';
import { CreateOrderDto } from '@app/contracts';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,

    @Inject('USERS_SERVICE')
    private readonly usersClient: ClientProxy,
  ) {}

  async create(data: CreateOrderDto) {
    // Consulta o microserviço de usuários
    const user = await firstValueFrom(
      this.usersClient
        .send('users.findOne', data.userId)
        .pipe(timeout(3000)),
    );

    if (!user) {
      throw new BadRequestException(
        'Usuário inválido',
      );
    }

    // Persiste o pedido no banco de Orders
    return this.prisma.order.create({
      data: {
        userId: data.userId,
        description: data.description,
        total: data.total,
      },
    });
  }

  findAll() {
    return this.prisma.order.findMany();
  }

  findOne(id: number) {
    return this.prisma.order.findUnique({
      where: { id },
    });
  }
}