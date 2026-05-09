import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductsService } from '../../../core/services/products.service';
import { CartService } from '../../../core/services/cart.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule],
  template: `
    <div class="shop-container">
      <div class="shop-hero">
        <h1>🛍️ MY SAFE SHOP</h1>
        <p>Ropa de segunda mano verificada y a precios increíbles</p>
      </div>

      <div class="filters">
        <button mat-button [class.active-filter]="selectedCategory === ''"
          (click)="onCategoryChange('')">Todos</button>
        <button mat-button *ngFor="let cat of categories"
          [class.active-filter]="selectedCategory === cat.id"
          (click)="onCategoryChange(cat.id)">{{ cat.name }}</button>
      </div>

      <div *ngIf="isLoading" class="loading">
        <mat-spinner diameter="50"></mat-spinner>
      </div>

      <div *ngIf="!isLoading" class="products-grid">
        <mat-card *ngFor="let product of products" class="product-card"
          [class.out-of-stock]="product.stock === 0">

          <div class="card-image" [routerLink]="['/shop', product.id]">
            <img [src]="product.imageUrl || 'https://via.placeholder.com/300x300?text=Sin+Imagen'"
              [alt]="product.name">
            <span class="condition-badge">{{ conditionLabels[product.condition] }}</span>
            <span class="stock-badge last-unit" *ngIf="product.stock === 1">
              ¡Última unidad!
            </span>
            <span class="stock-badge no-stock" *ngIf="product.stock === 0">
              Agotado
            </span>
          </div>

          <mat-card-content class="card-body" [routerLink]="['/shop', product.id]">
            <p class="product-brand">{{ product.brand || product.category?.name }}</p>
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-size" *ngIf="product.size">Talla: {{ product.size }}</p>
            <div class="card-footer">
              <span class="product-price">{{ formatPrice(product.price) }}</span>
              <button mat-mini-fab color="primary"
                (click)="addToCart(product); $event.stopPropagation()"
                [disabled]="product.stock === 0 || isInCart(product.id)">
                <mat-icon>{{ isInCart(product.id) ? 'check' : 'add_shopping_cart' }}</mat-icon>
              </button>
            </div>
          </mat-card-content>

        </mat-card>
      </div>

      <div *ngIf="!isLoading && products.length === 0" class="empty">
        <mat-icon>search_off</mat-icon>
        <p>No hay productos disponibles</p>
      </div>
    </div>
  `,
  styles: [`
    .shop-container { max-width: 1200px; margin: 0 auto; padding: 2rem 1rem; }
    .shop-hero { text-align: center; padding: 2rem 0;
      h1 { font-size: 2.5rem; color: #1a1033; }
      p { color: #6b7280; }
    }
    .filters {
      display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 1rem 0;
      padding: 1rem; background: white; border-radius: 12px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    }
    .active-filter { background: #7c3aed !important; color: white !important; border-radius: 99px !important; }
    .loading { display: flex; justify-content: center; padding: 4rem; }
    .products-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1.5rem; margin-top: 1.5rem;
    }
    .product-card {
      border-radius: 16px !important; overflow: hidden; transition: transform 0.2s;
      cursor: pointer;
      &:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(124,58,237,0.15) !important; }
    }
    .product-card.out-of-stock { opacity: 0.65; }
    .card-image {
      position: relative; height: 220px; background: #f3f4f6; cursor: pointer;
      img { width: 100%; height: 100%; object-fit: cover; }
    }
    .condition-badge {
      position: absolute; top: 10px; left: 10px;
      background: rgba(255,255,255,0.92); color: #7c3aed;
      font-size: 0.7rem; font-weight: 700; padding: 3px 10px; border-radius: 99px;
    }
    .stock-badge {
      position: absolute; top: 10px; right: 10px;
      font-size: 0.7rem; font-weight: 700; padding: 3px 8px; border-radius: 99px;
    }
    .last-unit { background: #fef3c7; color: #d97706; }
    .no-stock { background: #fee2e2; color: #dc2626; }
    .card-body { padding: 0.75rem 1rem 1rem !important; cursor: pointer; }
    .product-brand { color: #9ca3af; font-size: 0.8rem; margin: 0; text-transform: uppercase; }
    .product-name { font-weight: 700; font-size: 0.95rem; color: #1f2937; margin: 0.25rem 0; }
    .product-size { color: #6b7280; font-size: 0.8rem; margin: 0; }
    .card-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 0.75rem; }
    .product-price { font-weight: 800; font-size: 1.1rem; color: #7c3aed; }
    .empty { text-align: center; padding: 4rem;
      mat-icon { font-size: 3rem; color: #d1d5db; }
      p { color: #6b7280; }
    }
  `]
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  categories: any[] = [];
  selectedCategory = '';
  isLoading = true;
  cartProductIds: Set<string> = new Set();

  conditionLabels: Record<string, string> = {
    NEW: 'Nuevo', LIKE_NEW: 'Como Nuevo', GOOD: 'Buen Estado', FAIR: 'Aceptable',
  };

  constructor(
    private productsService: ProductsService,
    public cartService: CartService,
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
    this.cartService.items$.subscribe(items => {
      this.cartProductIds = new Set(items.map(i => i.product.id));
    });
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productsService.getProducts({
      categoryId: this.selectedCategory || undefined,
    }).subscribe({
      next: (res) => { this.products = res.products; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  loadCategories(): void {
    this.productsService.getCategories().subscribe({
      next: cats => this.categories = cats,
    });
  }

  onCategoryChange(catId: string): void {
    this.selectedCategory = catId;
    this.loadProducts();
  }

  isInCart(productId: string): boolean {
    return this.cartProductIds.has(productId);
  }

  addToCart(product: Product): void {
    if (product.stock === 0 || this.isInCart(product.id)) return;
    this.cartService.addItem(product, 1);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', maximumFractionDigits: 0,
    }).format(price);
  }
}