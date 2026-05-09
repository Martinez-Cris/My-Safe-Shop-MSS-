import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      datasources: {
        db: {
          url: 'postgresql://postgres:password123@localhost:5433/my_safe_shop_db',
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('🗄️  Prisma conectado a PostgreSQL');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}