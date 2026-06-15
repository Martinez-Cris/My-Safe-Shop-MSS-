import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class PaymentsService {
  private readonly wompiBaseUrl = 'https://sandbox.wompi.co/v1';
  private readonly publicKey: string;
  private readonly privateKey: string;
  private readonly integritySecret: string;
  private readonly eventsSecret: string;

  constructor(private readonly config: ConfigService) {
    this.publicKey = this.config.get<string>('WOMPI_PUBLIC_KEY') || '';
    this.privateKey = this.config.get<string>('WOMPI_PRIVATE_KEY') || '';
    this.integritySecret = this.config.get<string>('WOMPI_INTEGRITY_SECRET') || '';
    this.eventsSecret = this.config.get<string>('WOMPI_EVENTS_SECRET') || '';
  }

  async createPaymentIntent(params: {
    orderId: string;
    total: number;
    buyerEmail: string;
    buyerName: string;
    items: Array<{ name: string; quantity: number; unitPrice: number }>;
  }) {
    const frontendUrl = this.config.get<string>('FRONTEND_URL') || 'http://localhost:4200';
    const reference = `order-${params.orderId}-${Date.now()}`;
    const amountInCents = Math.round(params.total) * 100; // Convertir a centavos
    const currency = 'COP';
    const expirationTime = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hora

    // Generar firma de integridad
    const integritySignature = await this.generateIntegritySignature(
      reference,
      amountInCents,
      currency,
    );


    console.log('=== WOMPI DEBUG ===');
    console.log('Total recibido:', params.total);
    console.log('AmountInCents:', amountInCents);
    console.log('Reference:', reference);
    console.log('IntegritySecret:', this.integritySecret);
    console.log('Total recibido (tipo):', typeof params.total, params.total);
    console.log('AmountInCents calculado:', Math.round(params.total));
    console.log('Firma generada:', integritySignature);
    console.log('Data usada para firma:', `${reference}${amountInCents}${currency}${this.integritySecret}`);

    
    // Construir URL de checkout de Wompi
    const checkoutUrl = this.buildWompiCheckoutUrl({
      reference,
      amountInCents,
      currency,
      integritySignature,
      buyerEmail: params.buyerEmail,
      buyerName: params.buyerName,
      redirectUrl: `${frontendUrl}/checkout/success?orderId=${params.orderId}`,
      expirationTime,
    });

    return {
      orderId: params.orderId,
      gateway: 'wompi',
      checkoutUrl,
      paymentIntentId: reference,
      integritySignature,
      amountInCents,
      reference,
      currency,
      expirationTime,
      publicKey: this.publicKey,
    };
  }

  private async generateIntegritySignature(
    reference: string,
    amountInCents: number,
    currency: string,
  ): Promise<string> {
    const data = `${reference}${amountInCents}${currency}${this.integritySecret}`;
    const hash = crypto.createHash('sha256').update(data).digest('hex');
    return hash;
  }

  private buildWompiCheckoutUrl(params: {
    reference: string;
    amountInCents: number;
    currency: string;
    integritySignature: string;
    buyerEmail: string;
    buyerName: string;
    redirectUrl: string;
    expirationTime: string;
  }): string {
    const base = 'https://checkout.wompi.co/p/';
    const queryParams = new URLSearchParams({
      'public-key': this.publicKey,
      currency: params.currency,
      'amount-in-cents': params.amountInCents.toString(),
      reference: params.reference,
      'signature:integrity': params.integritySignature,
      'redirect-url': params.redirectUrl,
      'customer-data:email': params.buyerEmail,
      'customer-data:full-name': params.buyerName,
      'expiration-time': params.expirationTime,
    });
    return `${base}?${queryParams.toString()}`;
  }

  async verifyWompiEvent(signature: string, payload: any): Promise<boolean> {
    try {
      const { checksum, timestamp, events } = JSON.parse(
        Buffer.from(signature, 'base64').toString('utf8')
      );
      const data = `${timestamp}${events.join('')}${this.eventsSecret}`;
      const expectedChecksum = crypto.createHash('sha256').update(data).digest('hex');
      return checksum === expectedChecksum;
    } catch {
      return false;
    }
  }

  async getTransactionByReference(reference: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.wompiBaseUrl}/transactions?reference=${reference}`,
        {
          headers: { Authorization: `Bearer ${this.privateKey}` },
        }
      );
      return response.data?.data?.[0] || null;
    } catch {
      return null;
    }
  }

  // Mantener compatibilidad con el webhook
  constructStripeEvent(payload: Buffer, signature: string): any {
    throw new BadRequestException('Stripe no está configurado. Usa Wompi.');
  }
}