import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  async sendOrderNotification(data: {
    orderId: number;
    userId: number;
    total: string;
  }) {
    // Simulação de falha para testar a DLQ (Parte 5)
    if (data.total === '9999') {
      throw new Error('Falha simulada');
    }

    this.logger.log(`Notificação do pedido ${data.orderId}`);
    this.logger.log(`Usuário: ${data.userId}`);
    this.logger.log(`Total: R$ ${data.total}`);

    // Futuramente:
    // await this.emailService.send(...);

    return { success: true };
  }
}