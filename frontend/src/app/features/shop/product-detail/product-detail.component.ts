import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductsService } from '../../../core/services/products.service';
import { CartService } from '../../../core/services/cart.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule, MatChipsModule, MatSnackBarModule],
  template: `
    <div class="detail-container">
      <a routerLink="/shop" class="back-link">
        <mat-icon>arrow_back</mat-icon> Volver a la tienda
      </a>

      <div *ngIf="isLoading" class="loading">
        <mat-spinner diameter="50"></mat-spinner>
      </div>

      <div *ngIf="!isLoading && product" class="product-layout">

        <!-- Imagen -->
        <div class="product-image-section">
          <div class="main-image">
            <img [src]="product.imageUrl || 'https://via.placeholder.com/500x500?text=Sin+Imagen'"
              [alt]="product.name">
            <span class="condition-badge large">{{ conditionLabels[product.condition] }}</span>
            <span class="stock-badge last" *ngIf="product.stock === 1">¡Última unidad!</span>
            <span class="stock-badge out" *ngIf="product.stock === 0">Agotado</span>
          </div>
        </div>

        <!-- Info -->
        <div class="product-info-section">
          <div class="product-meta">
            <span class="product-category">{{ product.category?.name }}</span>
            <span class="product-brand">{{ product.brand }}</span>
          </div>

          <h1 class="product-name">{{ product.name }}</h1>

          <div class="product-price-section">
            <span class="product-price">{{ formatPrice(product.price) }}</span>
            <span class="price-note">Precio final — sin cargos adicionales</span>
          </div>

          <div class="product-specs">
            <div class="spec-item" *ngIf="product.size">
              <mat-icon>straighten</mat-icon>
              <div>
                <p class="spec-label">Talla</p>
                <p class="spec-value">{{ product.size }}</p>
              </div>
            </div>
            <div class="spec-item">
              <mat-icon>grade</mat-icon>
              <div>
                <p class="spec-label">Condición</p>
                <p class="spec-value">{{ conditionLabels[product.condition] }}</p>
              </div>
            </div>
            <div class="spec-item">
              <mat-icon>inventory_2</mat-icon>
              <div>
                <p class="spec-label">Disponibilidad</p>
                <p class="spec-value" [class.low-stock]="product.stock <= 1">
                  {{ product.stock === 0 ? 'Agotado' : product.stock === 1 ? 'Última unidad' : product.stock + ' disponibles' }}
                </p>
              </div>
            </div>
          </div>

          <div class="product-description">
            <h3>Descripción</h3>
            <p>{{ product.description }}</p>
          </div>

          <div class="product-actions">
            <button mat-raised-button color="primary" class="add-cart-btn"
              (click)="addToCart()"
              [disabled]="product.stock === 0 || isInCart">
              <mat-icon>{{ isInCart ? 'check' : 'add_shopping_cart' }}</mat-icon>
              {{ product.stock === 0 ? 'Agotado' : isInCart ? 'En tu carrito' : 'Agregar al carrito' }}
            </button>
            <button mat-stroked-button routerLink="/cart" *ngIf="isInCart" class="view-cart-btn">
              <mat-icon>shopping_cart</mat-icon> Ver carrito
            </button>
          </div>

          <div class="safe-buy">
            <mat-icon>verified_user</mat-icon>
            <p>Compra segura — procesada por Stripe. Artículo verificado por MY SAFE SHOP.</p>
          </div>
        </div>
      </div>

      <div *ngIf="!isLoading && !product" class="not-found">
        <mat-icon>search_off</mat-icon>
        <h2>Producto no encontrado</h2>
        <button mat-raised-button color="primary" routerLink="/shop">Volver a la tienda</button>
      </div>
    </div>
  `,
  styles: [`
    .detail-container { max-width: 1100px; margin: 0 auto; padding: 2rem 1rem; }
    .back-link {
      display: inline-flex; align-items: center; gap: 0.25rem;
      color: #7c3aed; text-decoration: none; font-size: 0.9rem; margin-bottom: 2rem;
      &:hover { text-decoration: underline; }
    }
    .loading { display: flex; justify-content: center; padding: 4rem; }
    .product-layout {
      display: grid; grid-template-columns: 1fr 1fr; gap: 3rem;
      @media (max-width: 768px) { grid-template-columns: 1fr; }
    }
    .main-image {
      position: relative; border-radius: 16px; overflow: hidden;
      aspect-ratio: 1; background: #f3f4f6;
      img { width: 100%; height: 100%; object-fit: cover; }
    }
    .condition-badge {
      position: absolute; top: 12px; left: 12px;
      background: rgba(255,255,255,0.95); color: #7c3aed;
      font-weight: 700; padding: 4px 14px; border-radius: 99px;
      &.large { font-size: 0.85rem; }
    }
    .stock-badge {
      position: absolute; top: 12px; right: 12px;
      font-weight: 700; font-size: 0.8rem; padding: 4px 12px; border-radius: 99px;
      &.last { background: #fef3c7; color: #d97706; }
      &.out { background: #fee2e2; color: #dc2626; }
    }
    .product-info-section { display: flex; flex-direction: column; gap: 1.5rem; }
    .product-meta {
      display: flex; gap: 0.75rem; align-items: center;
      .product-category { background: #f3e8ff; color: #7c3aed; font-size: 0.8rem; font-weight: 600; padding: 4px 12px; border-radius: 99px; }
      .product-brand { font-size: 0.85rem; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
    }
    .product-name { font-size: 1.75rem; font-weight: 800; color: #1a1033; margin: 0; line-height: 1.2; }
    .product-price-section {
      .product-price { font-size: 2rem; font-weight: 800; color: #7c3aed; display: block; }
      .price-note { font-size: 0.8rem; color: #9ca3af; }
    }
    .product-specs {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;
      padding: 1rem; background: #f9fafb; border-radius: 12px;
    }
    .spec-item {
      display: flex; gap: 0.5rem; align-items: flex-start;
      mat-icon { color: #7c3aed; font-size: 1.1rem; margin-top: 2px; }
      .spec-label { font-size: 0.75rem; color: #6b7280; margin: 0; }
      .spec-value { font-size: 0.9rem; font-weight: 600; color: #1f2937; margin: 0.15rem 0 0; }
      .low-stock { color: #d97706; }
    }
    .product-description {
      h3 { font-size: 1rem; font-weight: 600; color: #374151; margin: 0 0 0.5rem; }
      p { color: #6b7280; line-height: 1.7; margin: 0; }
    }
    .product-actions { display: flex; gap: 1rem; flex-wrap: wrap; }
    .add-cart-btn { height: 52px; font-size: 1rem; font-weight: 700; padding: 0 2rem; display: flex; align-items: center; gap: 0.5rem; }
    .view-cart-btn { height: 52px; font-size: 1rem; padding: 0 1.5rem; }
    .safe-buy {
      display: flex; gap: 0.5rem; align-items: flex-start;
      padding: 0.75rem 1rem; background: #f0fdf4; border-radius: 8px;
      mat-icon { color: #10b981; flex-shrink: 0; }
      p { font-size: 0.8rem; color: #065f46; margin: 0; line-height: 1.5; }
    }
    .not-found { text-align: center; padding: 4rem;
      mat-icon { font-size: 4rem; width: 4rem; height: 4rem; color: #d1d5db; }
      h2 { color: #374151; margin: 1rem 0 2rem; }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  isLoading = true;
  isInCart = false;

  conditionLabels: Record<string, string> = {
    NEW: 'Nuevo', LIKE_NEW: 'Como Nuevo', GOOD: 'Buen Estado', FAIR: 'Aceptable',
  };

  constructor(
    private route: ActivatedRoute,
    private productsService: ProductsService,
    private cartService: CartService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productsService.getProduct(id).subscribe({
        next: (product) => {
          this.product = product;
          this.isLoading = false;
          this.cartService.items$.subscribe(items => {
            this.isInCart = items.some(i => i.product.id === product.id);
          });
        },
        error: () => { this.isLoading = false; }
      });
    }
  }

  addToCart(): void {
    if (this.product && this.product.stock > 0 && !this.isInCart) {
      this.cartService.addItem(this.product, 1);
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', maximumFractionDigits: 0,
    }).format(price);
  }
} 
