import { Controller, Post, Req, Headers, HttpCode, BadRequestException, Logger } from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { OrdersService } from '../orders/orders.service';
import { OrdersGateway } from '../notifications/orders.gateway';
import { ConfigService } from '@nestjs/config';

@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly ordersService: OrdersService,
    private readonly ordersGateway: OrdersGateway,
    private readonly config: ConfigService,
  ) {}

  @Post('stripe')
  @HttpCode(200)
  async handleStripe(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!signature) throw new BadRequestException('Falta stripe-signature');
    let event: any;
    try {
      event = this.paymentsService.constructStripeEvent((req as any).rawBody, signature);
    } catch (err) {
      throw new BadRequestException(`Firma invalida: ${err.message}`);
    }
    this.logger.log(`Stripe event: ${event.type}`);
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      const paymentIntentId = session.payment_intent;
      if (orderId) {
        const order = await this.ordersService.markAsPaid(orderId, paymentIntentId);
        this.logger.log(`Orden ${orderId} marcada como PAGADA`);
        this.ordersGateway.notifyNewSale(order);
      }
    }
    return { received: true };
  }
}
