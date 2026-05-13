import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
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
  imports: [
    CommonModule, RouterLink, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatSnackBarModule,
  ],
  template: `
    <div class="shop-container">

      <div class="shop-hero">
        <div class="hero-content">
          <span class="hero-badge">🌿 Moda Sostenible</span>
          <h1>MY SAFE SHOP</h1>
          <p>Ropa de segunda mano verificada y a precios increíbles</p>
        </div>
      </div>

      <div class="search-bar-wrap">
        <mat-icon class="search-icon">search</mat-icon>
        <input
          class="search-input"
          type="text"
          placeholder="Buscar por nombre, marca, talla..."
          [(ngModel)]="searchText"
          (ngModelChange)="onSearch()"
        />
        <button *ngIf="searchText" class="clear-btn" (click)="clearSearch()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="filters">
        <button class="filter-btn" [class.active-filter]="selectedCategory === ''"
          (click)="onCategoryChange('')">
          <mat-icon>grid_view</mat-icon> Todos
        </button>
        <button class="filter-btn" *ngFor="let cat of categories"
          [class.active-filter]="selectedCategory === cat.id"
          (click)="onCategoryChange(cat.id)">
          {{ cat.name }}
        </button>
      </div>

      <div *ngIf="isLoading" class="loading">
        <mat-spinner diameter="50"></mat-spinner>
      </div>

      <p *ngIf="!isLoading && searchText" class="search-results-label">
        {{ filteredProducts.length }} resultado(s) para "<strong>{{ searchText }}</strong>"
      </p>

      <div *ngIf="!isLoading" class="products-grid">
        <mat-card *ngFor="let product of filteredProducts" class="product-card"
          [class.out-of-stock]="product.stock === 0">

          <div class="card-image" [routerLink]="['/shop', product.id]">
            <img [src]="product.imageUrl || 'https://via.placeholder.com/300x300?text=Sin+Imagen'"
              [alt]="product.name">
            <span class="condition-badge">{{ conditionLabels[product.condition] }}</span>
            <span class="stock-badge last-unit" *ngIf="product.stock === 1">¡Última unidad!</span>
            <span class="stock-badge no-stock" *ngIf="product.stock === 0">Agotado</span>
          </div>

          <mat-card-content class="card-body" [routerLink]="['/shop', product.id]">
            <p class="product-brand">{{ product.brand || product.category?.name }}</p>
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-size" *ngIf="product.size">Talla: {{ product.size }}</p>
            <div class="card-footer">
              <span class="product-price">{{ formatPrice(product.price) }}</span>
              <button class="cart-btn"
                (click)="addToCart(product); $event.stopPropagation()"
                [disabled]="product.stock === 0 || isInCart(product.id)">
                <mat-icon>{{ isInCart(product.id) ? 'check' : 'add_shopping_cart' }}</mat-icon>
              </button>
            </div>
          </mat-card-content>

        </mat-card>
      </div>

      <div *ngIf="!isLoading && filteredProducts.length === 0" class="empty">
        <mat-icon>search_off</mat-icon>
        <p>No hay productos disponibles</p>
      </div>

    </div>
  `,
  styles: [`
    .shop-container { max-width: 1200px; margin: 0 auto; padding: 2rem 1rem; }

    .shop-hero {
      background: linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%);
      border-radius: 20px; padding: 3rem 2rem; text-align: center;
      margin-bottom: 2rem; position: relative; overflow: hidden;
    }
    .shop-hero::before {
      content: ''; position: absolute; width: 300px; height: 300px;
      background: rgba(255,255,255,0.05); border-radius: 50%; top: -80px; right: -60px;
    }
    .hero-content { position: relative; z-index: 1; }
    .hero-badge {
      display: inline-block; background: rgba(255,255,255,0.15); color: #6ee7b7;
      padding: 0.3rem 1rem; border-radius: 99px; font-size: 0.85rem; font-weight: 600;
      margin-bottom: 1rem; backdrop-filter: blur(4px); border: 1px solid rgba(255,255,255,0.2);
    }
    .shop-hero h1 {
      font-size: 2.8rem; color: white; margin: 0.5rem 0;
      font-weight: 800; letter-spacing: 0.05em;
    }
    .shop-hero p { color: rgba(255,255,255,0.7); margin: 0; font-size: 1rem; }

    .search-bar-wrap {
      display: flex; align-items: center; background: white; border-radius: 14px;
      padding: 0.75rem 1.25rem; box-shadow: 0 2px 12px rgba(6,78,59,0.1);
      margin-bottom: 1.25rem; border: 2px solid transparent; transition: border-color 0.2s;
      &:focus-within { border-color: #10b981; }
    }
    .search-icon { color: #10b981; margin-right: 0.75rem; }
    .search-input {
      flex: 1; border: none; outline: none; font-size: 1rem;
      color: #1f2937; background: transparent;
      &::placeholder { color: #9ca3af; }
    }
    .clear-btn {
      background: none; border: none; cursor: pointer;
      color: #9ca3af; display: flex; align-items: center;
      &:hover { color: #ef4444; }
    }
    .search-results-label { color: #6b7280; font-size: 0.9rem; margin: 0 0 1rem; }

    .filters {
      display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 0 0 1.5rem;
      padding: 1rem 1.25rem; background: white; border-radius: 14px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    }
    .filter-btn {
      display: flex; align-items: center; gap: 0.35rem; padding: 0.4rem 1rem;
      border: 2px solid #e5e7eb; border-radius: 99px; background: white;
      color: #374151; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: all 0.2s;
      &:hover { border-color: #10b981; color: #059669; }
    }
    .active-filter { background: #059669 !important; color: white !important; border-color: #059669 !important; }

    .loading { display: flex; justify-content: center; padding: 4rem; }
    .products-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1.5rem; margin-top: 0.5rem;
    }
    .product-card {
      border-radius: 16px !important; overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; cursor: pointer;
      &:hover { transform: translateY(-5px); box-shadow: 0 16px 40px rgba(6,78,59,0.15) !important; }
    }
    .product-card.out-of-stock { opacity: 0.65; }
    .card-image {
      position: relative; height: 220px; background: #f0fdf4; cursor: pointer;
      img { width: 100%; height: 100%; object-fit: cover; }
    }
    .condition-badge {
      position: absolute; top: 10px; left: 10px;
      background: rgba(255,255,255,0.92); color: #059669;
      font-size: 0.7rem; font-weight: 700; padding: 3px 10px; border-radius: 99px;
    }
    .stock-badge { position: absolute; top: 10px; right: 10px; font-size: 0.7rem; font-weight: 700; padding: 3px 8px; border-radius: 99px; }
    .last-unit { background: #fef3c7; color: #d97706; }
    .no-stock { background: #fee2e2; color: #dc2626; }
    .card-body { padding: 0.75rem 1rem 1rem !important; cursor: pointer; }
    .product-brand { color: #9ca3af; font-size: 0.8rem; margin: 0; text-transform: uppercase; }
    .product-name { font-weight: 700; font-size: 0.95rem; color: #1f2937; margin: 0.25rem 0; }
    .product-size { color: #6b7280; font-size: 0.8rem; margin: 0; }
    .card-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 0.75rem; }
    .product-price { font-weight: 800; font-size: 1.1rem; color: #059669; }
    .cart-btn {
      width: 40px; height: 40px; border-radius: 50%;
      background: linear-gradient(135deg, #059669, #10b981);
      border: none; cursor: pointer; color: white;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 3px 10px rgba(16,185,129,0.35); transition: all 0.2s;
      &:hover:not(:disabled) { transform: scale(1.1); }
      &:disabled { opacity: 0.5; cursor: default; box-shadow: none; }
    }
    .empty { text-align: center; padding: 4rem;
      mat-icon { font-size: 3rem; color: #d1fae5; }
      p { color: #6b7280; }
    }
  `]
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: any[] = [];
  selectedCategory = '';
  searchText = '';
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
      next: (res) => {
        this.products = res.products;
        this.applySearch();
        this.isLoading = false;
      },
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

  onSearch(): void { this.applySearch(); }

  clearSearch(): void {
    this.searchText = '';
    this.applySearch();
  }

  applySearch(): void {
    const term = this.searchText.toLowerCase().trim();
    if (!term) { this.filteredProducts = this.products; return; }
    this.filteredProducts = this.products.filter(p =>
      p.name.toLowerCase().includes(term) ||
      (p.brand && p.brand.toLowerCase().includes(term)) ||
      (p.size && p.size.toLowerCase().includes(term)) ||
      (p.category?.name && p.category.name.toLowerCase().includes(term))
    );
  }

  isInCart(productId: string): boolean { return this.cartProductIds.has(productId); }

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