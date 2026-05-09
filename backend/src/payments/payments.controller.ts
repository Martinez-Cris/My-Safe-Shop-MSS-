import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { OrdersService } from '../orders/orders.service';
import { CreateOrderDto } from '../orders/dto/create-order.dto';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly ordersService: OrdersService,
  ) {}

  @Post('checkout')
  async checkout(@Body() dto: CreateOrderDto) {
    const order = await this.ordersService.create(dto);
    const items = (order as any).items.map((item: any) => ({
      name: item.product.name,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
    }));
    const payment = await this.paymentsService.createPaymentIntent({
      orderId: order.id,
      total: Number(order.total),
      buyerEmail: order.buyerEmail,
      buyerName: order.buyerName,
      items,
    });
    return { order, payment };
  }
}
