 import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PaymentsService } from '../../../core/services/payments.service';
import { Order } from '../../../core/models/product.model';

@Component({
  selector: 'app-checkout-success',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="success-page">
      <div class="success-card">
        <mat-icon class="check-icon">check_circle</mat-icon>
        <h1>¡Pago Exitoso!</h1>
        <p>Tu pedido ha sido confirmado.</p>
        <div *ngIf="order" class="order-summary">
          <div class="order-row"><span>Comprador</span><strong>{{ order.buyerName }}</strong></div>
          <div class="order-row total"><span>Total pagado</span><strong class="total-amount">{{ formatPrice(order.total) }}</strong></div>
        </div>
        <button mat-raised-button color="primary" routerLink="/shop">
          <mat-icon>storefront</mat-icon> Seguir comprando
        </button>
      </div>
    </div>
  `,
  styles: [`
    .success-page { min-height: calc(100vh - 64px); display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #f0fdf4, #ecfdf5); padding: 2rem; }
    .success-card { background: white; border-radius: 20px; padding: 3rem; text-align: center; max-width: 480px; width: 100%; box-shadow: 0 20px 60px rgba(16,185,129,0.15); }
    .check-icon { font-size: 5rem; width: 5rem; height: 5rem; color: #10b981; }
    h1 { color: #064e3b; margin: 1rem 0 0.5rem; }
    .order-summary { background: #f0fdf4; border-radius: 12px; padding: 1.25rem; margin: 1.5rem 0; text-align: left; }
    .order-row { display: flex; justify-content: space-between; padding: 0.4rem 0; }
    .total-amount { color: #10b981; font-size: 1.2rem; }
  `]
})
export class CheckoutSuccessComponent implements OnInit {
  order: Order | null = null;

  constructor(private route: ActivatedRoute, private paymentsService: PaymentsService) {}

  ngOnInit(): void {
    const orderId = this.route.snapshot.queryParamMap.get('orderId');
    if (orderId) {
      this.paymentsService.getOrder(orderId).subscribe({ next: (order) => this.order = order, error: () => {} });
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price);
  }
}
