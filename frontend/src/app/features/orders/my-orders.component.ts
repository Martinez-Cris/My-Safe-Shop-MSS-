import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';
import { Order } from '../../core/models/product.model';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule, MatChipsModule, MatExpansionModule],
  template: `
    <div class="orders-container">
      <div class="orders-header">
        <h1><mat-icon>receipt_long</mat-icon> Mis Pedidos</h1>
        <p>Historial de todas tus compras en MY SAFE SHOP</p>
      </div>

      <div *ngIf="isLoading" class="loading">
        <mat-spinner diameter="50"></mat-spinner>
      </div>

      <div *ngIf="!isLoading && orders.length === 0" class="empty-state">
        <mat-icon class="empty-icon">shopping_bag</mat-icon>
        <h2>Aún no tienes pedidos</h2>
        <p>Explora nuestra tienda y encuentra algo que te guste</p>
        <button mat-raised-button color="primary" routerLink="/shop">
          <mat-icon>storefront</mat-icon> Ir a la tienda
        </button>
      </div>

      <div *ngIf="!isLoading && orders.length > 0" class="orders-list">
        <mat-accordion>
          <mat-expansion-panel *ngFor="let order of orders" class="order-panel">
            <mat-expansion-panel-header>
              <mat-panel-title class="panel-title">
                <div class="order-summary">
                  <span class="order-id"># {{ order.id | slice:0:8 }}...</span>
                  <span class="status-badge" [ngClass]="getStatusClass(order.status)">
                    <mat-icon>{{ getStatusIcon(order.status) }}</mat-icon>
                    {{ getStatusLabel(order.status) }}
                  </span>
                </div>
              </mat-panel-title>
              <mat-panel-description class="panel-desc">
                <span class="order-total">{{ formatPrice(order.total) }}</span>
                <span class="order-date">{{ order.createdAt | date:'dd/MM/yyyy' }}</span>
              </mat-panel-description>
            </mat-expansion-panel-header>

            <div class="order-detail">
              <div class="order-items">
                <h4>Productos</h4>
                <div class="order-item" *ngFor="let item of order.items">
                  <img [src]="item.product?.imageUrl || 'https://via.placeholder.com/60'"
                    [alt]="item.product?.name">
                  <div class="item-info">
                    <p class="item-name">{{ item.product?.name }}</p>
                    <p class="item-meta">
                      Talla: {{ item.product?.size }} ·
                      Cant: {{ item.quantity }} ·
                      {{ formatPrice(item.unitPrice) }} c/u
                    </p>
                  </div>
                  <span class="item-subtotal">{{ formatPrice(item.unitPrice * item.quantity) }}</span>
                </div>
              </div>

              <div class="order-info">
                <div class="info-row">
                  <mat-icon>local_shipping</mat-icon>
                  <div>
                    <p class="info-label">Dirección de entrega</p>
                    <p class="info-value">{{ order.shippingAddress || 'No especificada' }}</p>
                  </div>
                </div>
                <div class="info-row" *ngIf="order.trackingNumber">
                  <mat-icon>track_changes</mat-icon>
                  <div>
                    <p class="info-label">Número de seguimiento</p>
                    <p class="info-value">{{ order.trackingNumber }}</p>
                  </div>
                </div>
                <div class="info-row" *ngIf="order.paymentConfirmedAt">
                  <mat-icon>check_circle</mat-icon>
                  <div>
                    <p class="info-label">Pago confirmado</p>
                    <p class="info-value">{{ order.paymentConfirmedAt | date:'dd/MM/yyyy HH:mm' }}</p>
                  </div>
                </div>
                <div class="order-total-row">
                  <span>Total pagado</span>
                  <strong class="total-amount">{{ formatPrice(order.total) }}</strong>
                </div>
              </div>
            </div>
          </mat-expansion-panel>
        </mat-accordion>
      </div>
    </div>
  `,
  styles: [`
    .orders-container { max-width: 900px; margin: 0 auto; padding: 2rem 1rem; }
    .orders-header {
      margin-bottom: 2rem;
      h1 { display: flex; align-items: center; gap: 0.5rem; font-size: 1.75rem; font-weight: 700; color: #064e3b; margin: 0 0 0.5rem; }
      p { color: #6b7280; margin: 0; }
    }
    .loading { display: flex; justify-content: center; padding: 4rem; }
    .empty-state {
      text-align: center; padding: 4rem;
      .empty-icon { font-size: 5rem; width: 5rem; height: 5rem; color: #d1d5db; }
      h2 { color: #374151; margin: 1rem 0 0.5rem; }
      p { color: #6b7280; margin-bottom: 2rem; }
    }
    .order-panel { margin-bottom: 1rem; border-radius: 12px !important; }
    .panel-title { flex: 2; }
    .panel-desc { flex: 1; display: flex; justify-content: space-between; align-items: center; }
    .order-summary { display: flex; align-items: center; gap: 1rem; }
    .order-id { font-family: monospace; font-size: 0.85rem; color: #6b7280; }
    .status-badge {
      display: flex; align-items: center; gap: 0.25rem;
      padding: 4px 12px; border-radius: 99px; font-size: 0.75rem; font-weight: 700;
      mat-icon { font-size: 0.9rem; width: 0.9rem; height: 0.9rem; }
      &.pending { background: #fef3c7; color: #d97706; }
      &.paid { background: #d1fae5; color: #065f46; }
      &.shipped { background: #dbeafe; color: #1e40af; }
      &.delivered { background: #f3f4f6; color: #374151; }
      &.cancelled { background: #fee2e2; color: #dc2626; }
    }
    .order-total { font-weight: 700; color: #059669; font-size: 1rem; }
    .order-date { font-size: 0.85rem; color: #6b7280; }
    .order-detail { padding-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;
      @media (max-width: 700px) { grid-template-columns: 1fr; } }
    .order-items {
      h4 { font-size: 0.9rem; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 1rem; }
    }
    .order-item {
      display: flex; gap: 0.75rem; align-items: center; margin-bottom: 0.75rem;
      padding-bottom: 0.75rem; border-bottom: 1px solid #f3f4f6;
      img { width: 56px; height: 56px; object-fit: cover; border-radius: 8px; flex-shrink: 0; }
      .item-name { font-weight: 600; font-size: 0.9rem; margin: 0; }
      .item-meta { color: #6b7280; font-size: 0.8rem; margin: 0.25rem 0 0; }
      .item-subtotal { margin-left: auto; font-weight: 700; color: #059669; white-space: nowrap; }
    }
    .order-info { display: flex; flex-direction: column; gap: 1rem; }
    .info-row {
      display: flex; gap: 0.75rem; align-items: flex-start;
      mat-icon { color: #059669; margin-top: 2px; flex-shrink: 0; }
      .info-label { font-size: 0.8rem; color: #6b7280; margin: 0; }
      .info-value { font-size: 0.9rem; font-weight: 500; margin: 0.25rem 0 0; }
    }
    .order-total-row {
      display: flex; justify-content: space-between; align-items: center;
      padding-top: 1rem; border-top: 2px solid #f3f4f6; font-size: 1rem;
      .total-amount { color: #059669; font-size: 1.25rem; }
    }
  `]
})
export class MyOrdersComponent implements OnInit {
  orders: any[] = [];
  isLoading = true;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    const user = this.authService.getUser();
    if (!user) return;

    this.http.get<any[]>(`${environment.apiUrl}/orders/my-orders`).subscribe({
      next: (orders) => { this.orders = orders; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', maximumFractionDigits: 0,
    }).format(price);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'Pendiente', PAID: 'Pagado',
      SHIPPED: 'Enviado', DELIVERED: 'Entregado', CANCELLED: 'Cancelado',
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      PENDING: 'pending', PAID: 'paid',
      SHIPPED: 'shipped', DELIVERED: 'delivered', CANCELLED: 'cancelled',
    };
    return classes[status] || '';
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      PENDING: 'hourglass_empty', PAID: 'check_circle',
      SHIPPED: 'local_shipping', DELIVERED: 'done_all', CANCELLED: 'cancel',
    };
    return icons[status] || 'help';
  }
}
