 import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { SaleNotification } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private socket: Socket;
  private newSale$ = new Subject<SaleNotification>();
  private connected$ = new Subject<boolean>();

  constructor() {
    this.socket = io(`${environment.wsUrl}/notifications`, {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket conectado:', this.socket.id);
      this.connected$.next(true);
      this.socket.emit('join_admin');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket desconectado');
      this.connected$.next(false);
    });

    this.socket.on('new_sale', (notification: SaleNotification) => {
      console.log('Nueva venta recibida:', notification);
      this.newSale$.next(notification);
    });
  }

  onNewSale(): Observable<SaleNotification> {
    return this.newSale$.asObservable();
  }

  onConnectionChange(): Observable<boolean> {
    return this.connected$.asObservable();
  }

  testNotification(): void {
    this.socket.emit('test_notification');
  }

  disconnect(): void {
    this.socket.disconnect();
  }
}
