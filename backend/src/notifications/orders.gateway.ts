import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:4200', credentials: true },
  namespace: '/notifications',
})
export class OrdersGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() private server: Server;
  private readonly logger = new Logger(OrdersGateway.name);

  afterInit() { this.logger.log('OrdersGateway inicializado'); }

  handleConnection(client: Socket) {
    client.emit('connected', { message: 'Conectado a MY SAFE SHOP', socketId: client.id });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('join_admin')
  handleJoinAdmin(@MessageBody() data: any, client?: Socket) {
    client?.join('admin_room');
    client?.emit('admin_joined', { message: 'Bienvenido al panel admin' });
  }

  notifyNewSale(order: any) {
    const notification = {
      type: 'NEW_SALE',
      orderId: order.id,
      buyerName: order.buyerName,
      buyerEmail: order.buyerEmail,
      total: Number(order.total),
      itemCount: order.items?.length || 0,
      products: order.items?.map((i: any) => i.product?.name || 'Producto') || [],
      paidAt: order.paymentConfirmedAt || new Date(),
    };
    this.logger.log(`Nueva venta: Orden ${order.id}`);
    this.server.to('admin_room').emit('new_sale', notification);
    this.server.emit('new_sale', notification);
  }

  @SubscribeMessage('test_notification')
  sendTestNotification() {
    const test = {
      type: 'NEW_SALE',
      orderId: 'test-' + Date.now(),
      buyerName: 'Cliente de Prueba',
      buyerEmail: 'test@test.com',
      total: 85000,
      itemCount: 1,
      products: ['Abrigo de Lana Zara — Camel'],
      paidAt: new Date(),
    };
    this.server.emit('new_sale', test);
    return { status: 'Notificacion de prueba enviada' };
  }
}
