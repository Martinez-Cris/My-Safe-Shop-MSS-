import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { OrdersRepository } from './repositories/orders.repository';
import { ProductsRepository } from '../products/repositories/products.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly productsRepository: ProductsRepository,
  ) {}

  async create(dto: CreateOrderDto, userEmail?: string) {
    let total = 0;
    const itemsData = [];

    for (const item of dto.items) {
      const product = await this.productsRepository.findById(item.productId);
      if (!product) throw new NotFoundException(`Producto ${item.productId} no encontrado`);
      if (product.stock < item.quantity) {
        throw new BadRequestException(`Stock insuficiente para "${product.name}"`);
      }
      const unitPrice = Number(product.price);
      total += unitPrice * item.quantity;
      itemsData.push({ productId: item.productId, quantity: item.quantity, unitPrice });
    }

    const buyerEmail = userEmail || dto.buyerEmail;

    return this.ordersRepository.create({
      buyerName: dto.buyerName,
      buyerEmail: buyerEmail,
      buyerPhone: dto.buyerPhone,
      shippingAddress: dto.shippingAddress,
      total,
      status: OrderStatus.PENDING,
      items: {
        create: itemsData.map(i => ({
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          product: { connect: { id: i.productId } },
        })),
      },
    });
  }

  async findAll() {
    return this.ordersRepository.findAll();
  }

  async findOne(id: string) {
    const order = await this.ordersRepository.findById(id);
    if (!order) throw new NotFoundException(`Orden ${id} no encontrada`);
    return order;
  }

  async findByEmail(email: string) {
    return this.ordersRepository.findByEmail(email);
  }

  async markAsPaid(orderId: string, paymentIntentId: string) {
    const order = await this.findOne(orderId);
    for (const item of (order as any).items) {
      await this.productsRepository.decrementStock(item.productId, item.quantity);
    }
    return this.ordersRepository.updateStatus(orderId, OrderStatus.PAID, {
      paymentIntentId,
      paymentConfirmedAt: new Date(),
    });
  }

  async findByPaymentIntentId(paymentIntentId: string) {
    return this.ordersRepository.findByPaymentIntentId(paymentIntentId);
  }

  async markAsShipped(id: string, trackingNumber: string) {
    await this.findOne(id);
    return this.ordersRepository.updateStatus(id, OrderStatus.SHIPPED, {
      trackingNumber,
      shippedAt: new Date(),
    });
  }
    async markAsDelivered(id: string) {
  const order = await this.findOne(id);

  for (const item of (order as any).items) {
    const updated = await this.productsRepository.decrementStock(item.productId, item.quantity);
    if (updated.stock <= 0) {
      await this.productsRepository.update(item.productId, {
        stock: 0,
        isActive: false,
      });
    }
  }

  return this.ordersRepository.updateStatus(id, OrderStatus.DELIVERED);
}


async markAsCancelled(id: string) {
  await this.findOne(id);
  return this.ordersRepository.updateStatus(id, OrderStatus.CANCELLED);
}
}