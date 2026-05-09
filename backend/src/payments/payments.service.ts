import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;
  private readonly gateway: string;

  constructor(private readonly config: ConfigService) {
    this.gateway = this.config.get<string>('PAYMENT_GATEWAY') || 'stripe';
    if (this.gateway === 'stripe') {
      this.stripe = new Stripe(this.config.get<string>('STRIPE_SECRET_KEY'), {
        apiVersion: '2023-10-16',
      });
    }
  }

  async createPaymentIntent(params: {
    orderId: string;
    total: number;
    buyerEmail: string;
    buyerName: string;
    items: Array<{ name: string; quantity: number; unitPrice: number }>;
  }) {
    if (this.gateway === 'stripe') return this.createStripeIntent(params);
    throw new BadRequestException(`Pasarela no soportada: ${this.gateway}`);
  }

  private async createStripeIntent(params: any) {
    const frontendUrl = this.config.get<string>('FRONTEND_URL') || 'http://localhost:4200';
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: params.buyerEmail,
      line_items: params.items.map((item: any) => ({
        price_data: {
          currency: 'cop',
          product_data: { name: item.name },
          unit_amount: Math.round(item.unitPrice),
        },
        quantity: item.quantity,
      })),
      metadata: { orderId: params.orderId },
      success_url: `${frontendUrl}/checkout/success?orderId=${params.orderId}`,
      cancel_url: `${frontendUrl}/checkout/cancel?orderId=${params.orderId}`,
    });
    return {
      orderId: params.orderId,
      gateway: 'stripe',
      checkoutUrl: session.url,
      paymentIntentId: session.payment_intent || session.id,
    };
  }

  constructStripeEvent(payload: Buffer, signature: string) {
    const secret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    return this.stripe.webhooks.constructEvent(payload, signature, secret);
  }
}
