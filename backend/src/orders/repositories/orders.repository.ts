import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Order, Prisma } from '@prisma/client';

@Injectable()
export class OrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.OrderCreateInput): Promise<Order> {
    return this.prisma.order.create({
      data,
      include: { items: { include: { product: true } } },
    });
  }

  async findAll(): Promise<Order[]> {
    return this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: true } } },
    });
  }

  async findById(id: string): Promise<Order | null> {
    return this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });
  }

  async findByEmail(email: string): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: { buyerEmail: email },
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: true } } },
    });
  }

  async findByPaymentIntentId(paymentIntentId: string): Promise<Order | null> {
    return this.prisma.order.findUnique({
      where: { paymentIntentId },
      include: { items: { include: { product: true } } },
    });
  }

  async updateStatus(id: string, status: string, extra?: Partial<Prisma.OrderUpdateInput>): Promise<Order> {
    return this.prisma.order.update({
      where: { id },
      data: { status, ...extra },
      include: { items: { include: { product: true } } },
    });
  }
}