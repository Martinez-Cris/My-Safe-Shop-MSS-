import { Controller, Post, Req, Headers, HttpCode, Logger, Body } from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { OrdersService } from '../orders/orders.service';
import { OrdersGateway } from '../notifications/orders.gateway';

@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly ordersService: OrdersService,
    private readonly ordersGateway: OrdersGateway,
  ) {}

  @Post('wompi')
  @HttpCode(200)
  async handleWompi(
    @Body() body: any,
    @Headers('x-event-checksum') checksum: string,
  ) {
    this.logger.log(`Wompi event: ${body?.event}`);

    // En sandbox podemos procesar sin verificar firma estrictamente
    if (body?.event === 'transaction.updated') {
      const transaction = body?.data?.transaction;
      if (!transaction) return { received: true };

      const status = transaction.status;
      const reference = transaction.reference;

      this.logger.log(`Transacción ${reference} — Status: ${status}`);

      if (status === 'APPROVED') {
        // Extraer orderId de la referencia (formato: order-{orderId}-{timestamp})
        const parts = reference.split('-');
        // reference = "order-{uuid}-{timestamp}"
        // uuid tiene guiones, así que tomamos todo excepto el primer y último segmento
        const orderId = parts.slice(1, -1).join('-');

        if (orderId) {
          try {
            const order = await this.ordersService.markAsPaid(orderId, transaction.id.toString());
            this.logger.log(`Orden ${orderId} marcada como PAGADA`);
            this.ordersGateway.notifyNewSale(order);
          } catch (err) {
            this.logger.error(`Error al marcar orden ${orderId}: ${(err as any).message}`);
          }
        }
      }
    }

    return { received: true };
  }

  // Mantener ruta de Stripe por compatibilidad (no hace nada)
  @Post('stripe')
  @HttpCode(200)
  async handleStripe(@Req() req: Request) {
    this.logger.log('Stripe webhook recibido pero Wompi está activo');
    return { received: true };
  }
}