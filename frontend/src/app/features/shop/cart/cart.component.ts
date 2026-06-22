import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CartService } from '../../../core/services/cart.service';
import { PaymentsService } from '../../../core/services/payments.service';
import { CartItem } from '../../../core/models/product.model';

declare const WidgetCheckout: any;

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatCardModule, MatButtonModule,
    MatIconModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule,
    MatDividerModule, MatSnackBarModule],
  template: `
    <div class="cart-container">
      <h1><mat-icon>shopping_bag</mat-icon> Tu Carrito</h1>

      <div *ngIf="cartItems.length === 0" class="empty-cart">
        <mat-icon class="empty-icon">shopping_cart</mat-icon>
        <h2>Tu carrito está vacío</h2>
        <p>Explora nuestra colección de ropa de segunda mano</p>
        <button mat-raised-button color="primary" routerLink="/shop">
          <mat-icon>storefront</mat-icon> Ver Productos
        </button>
      </div>

      <div *ngIf="cartItems.length > 0" class="cart-content">
        <div class="cart-items">
          <mat-card *ngFor="let item of cartItems" class="cart-item">
            <img [src]="getItemImage(item)" [alt]="item.product.name">
            <div class="item-info">
              <h3>{{ item.product.name }}</h3>
              <p class="item-meta">{{ item.product.brand }} · Talla {{ item.product.size }}</p>
              <p class="item-price">{{ formatPrice(item.product.price) }}</p>
              <span class="single-unit-badge" *ngIf="item.product.stock <= 1">
                <mat-icon>info</mat-icon> Artículo único — solo 1 disponible
              </span>
            </div>
            <div class="item-controls">
              <div class="qty-control" *ngIf="item.product.stock > 1; else singleUnit">
                <button mat-icon-button (click)="updateQty(item.product.id, item.quantity - 1)">
                  <mat-icon>remove</mat-icon>
                </button>
                <span class="qty">{{ item.quantity }}</span>
                <button mat-icon-button (click)="updateQty(item.product.id, item.quantity + 1)"
                  [disabled]="item.quantity >= item.product.stock">
                  <mat-icon>add</mat-icon>
                </button>
              </div>
              <ng-template #singleUnit>
                <span class="qty-fixed">Cant: 1</span>
              </ng-template>
              <p class="item-subtotal">{{ formatPrice(item.product.price * item.quantity) }}</p>
              <button mat-icon-button color="warn" (click)="removeItem(item.product.id)">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </mat-card>
        </div>

        <div class="checkout-panel">
          <!-- Resumen -->
          <mat-card class="summary-card">
            <h3><mat-icon>receipt_long</mat-icon> Resumen del Pedido</h3>
            <mat-divider></mat-divider>
            <div class="summary-row" *ngFor="let item of cartItems">
              <span>{{ item.product.name | slice:0:25 }}...</span>
              <span>{{ formatPrice(item.product.price * item.quantity) }}</span>
            </div>
            <mat-divider></mat-divider>
            <div class="summary-total">
              <strong>Total a pagar</strong>
              <strong class="total-price">{{ formatPrice(total) }}</strong>
            </div>
          </mat-card>

          <!-- Formulario -->
          <mat-card class="buyer-form-card">
            <h3><mat-icon>local_shipping</mat-icon> Datos de Entrega</h3>
            <form [formGroup]="checkoutForm" class="checkout-form">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nombre completo</mat-label>
                <input matInput formControlName="buyerName">
                <mat-icon matSuffix>person</mat-icon>
                <mat-error>El nombre es requerido</mat-error>
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Correo electrónico</mat-label>
                <input matInput formControlName="buyerEmail" type="email">
                <mat-icon matSuffix>email</mat-icon>
                <mat-error>Email inválido</mat-error>
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Teléfono (opcional)</mat-label>
                <input matInput formControlName="buyerPhone">
                <mat-icon matSuffix>phone</mat-icon>
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Dirección de entrega</mat-label>
                <textarea matInput formControlName="shippingAddress" rows="2"></textarea>
                <mat-error>La dirección es requerida</mat-error>
              </mat-form-field>

              <!-- Botón de pago mejorado -->
              <button class="pay-btn" (click)="onCheckout()" [disabled]="isLoading || widgetOpen">
                <div class="pay-btn-inner" *ngIf="!isLoading">
                  <mat-icon>lock</mat-icon>
                  <div class="pay-btn-text">
                    <span class="pay-label">Pagar de forma segura</span>
                    <span class="pay-amount">{{ formatPrice(total) }}</span>
                  </div>
                  <mat-icon class="pay-arrow">arrow_forward</mat-icon>
                </div>
                <div class="pay-btn-loading" *ngIf="isLoading">
                  <mat-spinner diameter="24"></mat-spinner>
                  <span>Procesando...</span>
                </div>
              </button>

              <div class="pay-badges">
                <span class="badge"><mat-icon>verified_user</mat-icon> Pago seguro</span>
                <span class="badge"><mat-icon>payment</mat-icon> Wompi</span>
                <span class="badge"><mat-icon>credit_card</mat-icon> Tarjeta / Nequi</span>
              </div>
            </form>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cart-container { max-width: 1100px; margin: 0 auto; padding: 2rem 1rem;
      h1 { display: flex; align-items: center; gap: 0.5rem; font-size: 1.75rem; font-weight: 700; margin-bottom: 1.5rem; } }
    .empty-cart { text-align: center; padding: 4rem;
      .empty-icon { font-size: 5rem; width: 5rem; height: 5rem; color: #d1d5db; }
      h2 { margin: 1rem 0 0.5rem; } p { color: #6b7280; margin-bottom: 2rem; } }
    .cart-content { display: grid; grid-template-columns: 1fr 400px; gap: 2rem;
      @media (max-width: 900px) { grid-template-columns: 1fr; } }
    .cart-item {
  display: flex; flex-direction: row; gap: 1.25rem; padding: 1.25rem;
  margin-bottom: 1rem; align-items: center; border-radius: 16px !important;
  border: 2px solid #e5e7eb; transition: border-color 0.2s;
  &:hover { border-color: #a7f3d0; }
  img { width: 110px; height: 110px; object-fit: cover; border-radius: 12px;
    flex-shrink: 0; border: 1px solid #e5e7eb; }
}
.item-info { flex: 1;
  h3 { margin: 0 0 0.25rem; font-size: 1rem; font-weight: 700; color: #064e3b; }
  .item-meta { color: #6b7280; font-size: 0.85rem; margin: 0.25rem 0; }
  .item-price { color: #059669; font-weight: 800; font-size: 1.25rem; margin: 0.35rem 0; } }
.single-unit-badge { display: flex; align-items: center; gap: 0.25rem; font-size: 0.75rem; color: #d97706; background: #fef3c7; padding: 2px 8px; border-radius: 99px; margin-top: 0.25rem;
  mat-icon { font-size: 0.85rem; width: 0.85rem; height: 0.85rem; } }
.item-controls { display: flex; flex-direction: column; align-items: flex-end;
  gap: 0.5rem; min-width: 90px; }
.qty-control { display: flex; align-items: center; gap: 0.25rem; border: 1px solid #e5e7eb; border-radius: 8px; padding: 0 4px;
  .qty { min-width: 28px; text-align: center; font-weight: 600; } }
.qty-fixed { font-size: 0.85rem; color: #6b7280; border: 1px solid #e5e7eb; padding: 4px 10px; border-radius: 8px; }
.item-subtotal { font-weight: 800; color: #059669; font-size: 1.1rem; margin: 0; }
    .checkout-panel { display: flex; flex-direction: column; gap: 1rem; }
    .summary-card { padding: 1.25rem;
      h3 { display: flex; align-items: center; gap: 0.5rem; margin: 0 0 0.75rem; font-size: 1rem; font-weight: 700;
        mat-icon { color: #059669; font-size: 1.2rem; } }
      .summary-row { display: flex; justify-content: space-between; padding: 0.4rem 0; font-size: 0.85rem; color: #374151; }
      mat-divider { margin: 0.75rem 0; } }
    .summary-total { display: flex; justify-content: space-between; font-size: 1.15rem; align-items: center;
      .total-price { color: #059669; font-size: 1.5rem; font-weight: 800; } }
    .buyer-form-card { padding: 1.25rem;
      h3 { display: flex; align-items: center; gap: 0.5rem; margin: 0 0 1rem; font-size: 1rem; font-weight: 700;
        mat-icon { color: #059669; font-size: 1.2rem; } } }
    .checkout-form { display: flex; flex-direction: column; gap: 0.5rem; }
    .full-width { width: 100%; }

    /* Botón de pago */
    .pay-btn {
      width: 100%; border: none; border-radius: 16px; cursor: pointer; margin-top: 0.75rem;
      padding: 0; overflow: hidden;
      background: linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%);
      box-shadow: 0 8px 25px rgba(5,150,105,0.45);
      transition: transform 0.2s, box-shadow 0.2s;
      &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 35px rgba(5,150,105,0.55); }
      &:active:not(:disabled) { transform: translateY(0); }
      &:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    }
    .pay-btn-inner {
      display: flex; align-items: center; gap: 1rem;
      padding: 1rem 1.5rem;
      mat-icon { color: white; font-size: 1.5rem; width: 1.5rem; height: 1.5rem; flex-shrink: 0; }
      .pay-arrow { margin-left: auto; opacity: 0.8; }
    }
    .pay-btn-text { display: flex; flex-direction: column; align-items: flex-start;
      .pay-label { color: rgba(255,255,255,0.9); font-size: 0.85rem; font-weight: 500; }
      .pay-amount { color: white; font-size: 1.4rem; font-weight: 800; line-height: 1.2; }
    }
    .pay-btn-loading { display: flex; align-items: center; justify-content: center; gap: 0.75rem;
      padding: 1.1rem; color: white; font-size: 1rem; font-weight: 600; }

    /* Badges de seguridad */
    .pay-badges { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; margin-top: 0.75rem; }
    .badge { display: flex; align-items: center; gap: 0.25rem; font-size: 0.72rem; color: #6b7280;
      background: #f9fafb; border: 1px solid #e5e7eb; padding: 3px 10px; border-radius: 99px;
      mat-icon { font-size: 0.85rem; width: 0.85rem; height: 0.85rem; color: #059669; } }
  `]
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  total = 0;
  isLoading = false;
  widgetOpen = false;
  checkoutForm: FormGroup;
  private currentOrderId: string | null = null;
  private wompiWidget: any = null;

  constructor(
    public cartService: CartService,
    private paymentsService: PaymentsService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
  ) {
    this.checkoutForm = this.fb.group({
      buyerName: ['', Validators.required],
      buyerEmail: ['', [Validators.required, Validators.email]],
      buyerPhone: [''],
      shippingAddress: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.cartService.items$.subscribe(items => {
      this.cartItems = items;
      this.total = items.reduce((acc, i) => acc + Number(i.product.price) * i.quantity, 0);
    });
  }

  getItemImage(item: CartItem): string {
    const product = item.product as any;
    if (product?.images?.length > 0) return product.images[0].base64;
    if (product?.imageUrl) return product.imageUrl;
    return 'https://via.placeholder.com/100';
  }

  removeItem(productId: string): void { this.cartService.removeItem(productId); }

  updateQty(productId: string, qty: number): void {
    this.cartService.updateQuantity(productId, qty);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', maximumFractionDigits: 0,
    }).format(price);
  }

  onCheckout(): void {
    if (this.isLoading || this.widgetOpen) return;
    if (this.checkoutForm.invalid) { this.checkoutForm.markAllAsTouched(); return; }
    if (this.cartItems.length === 0) {
      this.snackBar.open('Tu carrito está vacío', 'OK', { duration: 3000 }); return;
    }
    this.isLoading = true;
    const formValue = this.checkoutForm.value;
    const payload = this.paymentsService.buildCheckoutPayload(this.cartItems, {
      name: formValue.buyerName,
      email: formValue.buyerEmail,
      phone: formValue.buyerPhone,
      address: formValue.shippingAddress,
    });

    this.paymentsService.checkout(payload).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.currentOrderId = response.order.id;
        this.openWompiWidget(response.payment);
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open(err.error?.message || 'Error al procesar el pago', 'Cerrar', { duration: 5000 });
      },
    });
  }

  private openWompiWidget(payment: any): void {
    if (this.wompiWidget) return;

    this.wompiWidget = new WidgetCheckout({
      currency: payment.currency || 'COP',
      amountInCents: payment.amountInCents,
      reference: payment.reference,
      publicKey: payment.publicKey,
      signature: { integrity: payment.integritySignature },
      expirationTime: payment.expirationTime,
      customerData: {
        email: this.checkoutForm.value.buyerEmail,
        fullName: this.checkoutForm.value.buyerName,
      },
    });

    this.widgetOpen = true;

    this.wompiWidget.open((result: any) => {
      this.wompiWidget = null;
      this.widgetOpen = false;
      const transaction = result?.transaction;
      if (transaction?.status === 'APPROVED') {
        this.cartService.clear();
        this.snackBar.open('✅ ¡Pago aprobado! Tu pedido está confirmado.', 'OK', { duration: 5000 });
        this.router.navigate(['/checkout/success'], {
          queryParams: { orderId: this.currentOrderId }
        });
      } else if (transaction?.status === 'DECLINED') {
        this.snackBar.open('❌ Pago rechazado. Intenta con otra tarjeta.', 'Cerrar', { duration: 5000 });
      } else {
        this.snackBar.open('Pago cancelado o pendiente.', 'OK', { duration: 3000 });
      }
    });
  }
}