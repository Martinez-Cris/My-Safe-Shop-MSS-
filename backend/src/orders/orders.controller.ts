import { Controller, Get, Post, Param, Body, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Body() dto: CreateOrderDto, @Req() req: any) {
    return this.ordersService.create(dto, req.user?.email);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN' as any)
  @ApiBearerAuth()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get('my-orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getMyOrders(@Req() req: any) {
    return this.ordersService.findByEmail(req.user.email);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/ship')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN' as any)
  @ApiBearerAuth()
  markShipped(@Param('id') id: string, @Body('trackingNumber') trackingNumber: string) {
    return this.ordersService.markAsShipped(id, trackingNumber);
  }

  @Patch(':id/deliver')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN' as any)
  @ApiBearerAuth()
  markDelivered(@Param('id') id: string) {
    return this.ordersService.markAsDelivered(id);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN' as any)
  @ApiBearerAuth()
  markCancelled(@Param('id') id: string) {
    return this.ordersService.markAsCancelled(id);
  }
}