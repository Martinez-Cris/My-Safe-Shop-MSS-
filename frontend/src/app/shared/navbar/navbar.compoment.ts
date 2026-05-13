import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatBadgeModule],
  template: `
    <nav class="navbar">
      <div class="navbar-inner">

        <a class="brand" routerLink="/shop">
          <mat-icon>storefront</mat-icon>
          <span>MY SAFE SHOP</span>
        </a>

        <div class="nav-actions">
          <ng-container *ngIf="!isAdmin()">
            <a class="nav-btn" routerLink="/shop">
              <mat-icon>storefront</mat-icon>
              <span>Tienda</span>
            </a>
            <a class="nav-btn" routerLink="/mis-pedidos">
              <mat-icon>receipt_long</mat-icon>
              <span>Mis Pedidos</span>
            </a>
            <a class="nav-btn cart-btn" routerLink="/cart">
              <mat-icon [matBadge]="cartCount > 0 ? cartCount : null"
                matBadgeColor="warn" matBadgeSize="small">
                shopping_cart
              </mat-icon>
              <span>Carrito</span>
            </a>
            <a class="nav-btn" routerLink="/perfil">
              <mat-icon>account_circle</mat-icon>
              <span>Mi Perfil</span>
            </a>
          </ng-container>

          <ng-container *ngIf="isAdmin()">
            <a class="nav-btn" routerLink="/admin">
              <mat-icon>dashboard</mat-icon>
              <span>Panel Admin</span>
            </a>
          </ng-container>

          <button class="logout-btn" (click)="logout()">
            <mat-icon>logout</mat-icon>
            <span>Salir</span>
          </button>
        </div>

      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: sticky; top: 0; z-index: 100;
      background: linear-gradient(90deg, #064e3b 0%, #065f46 100%);
      box-shadow: 0 2px 16px rgba(6,78,59,0.25);
    }
    .navbar-inner {
      max-width: 1200px; margin: 0 auto;
      padding: 0 1.5rem;
      display: flex; align-items: center;
      justify-content: space-between;
      height: 64px;
    }
    .brand {
      display: flex; align-items: center; gap: 0.6rem;
      text-decoration: none; color: white;
      font-weight: 800; font-size: 1.1rem; letter-spacing: 0.05em;
      mat-icon { color: #6ee7b7; font-size: 1.75rem; width: 1.75rem; height: 1.75rem; }
    }
    .nav-actions {
      display: flex; align-items: center; gap: 0.25rem;
    }
    .nav-btn {
      display: flex; align-items: center; gap: 0.35rem;
      padding: 0.5rem 0.85rem; border-radius: 10px;
      text-decoration: none; color: rgba(255,255,255,0.8);
      font-size: 0.875rem; font-weight: 500;
      transition: all 0.2s;
      mat-icon { font-size: 1.25rem; width: 1.25rem; height: 1.25rem; }
      &:hover { background: rgba(255,255,255,0.12); color: white; }
    }
    .logout-btn {
      display: flex; align-items: center; gap: 0.35rem;
      padding: 0.5rem 0.85rem; border-radius: 10px;
      background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3);
      color: #fca5a5; font-size: 0.875rem; font-weight: 500;
      cursor: pointer; transition: all 0.2s;
      mat-icon { font-size: 1.25rem; width: 1.25rem; height: 1.25rem; }
      &:hover { background: rgba(239,68,68,0.3); color: white; }
    }
    @media (max-width: 640px) {
      .nav-btn span, .logout-btn span { display: none; }
      .brand span { display: none; }
    }
  `]
})
export class NavbarComponent {
  cartCount = 0;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router,
  ) {
    this.cartService.items$.subscribe(items => {
      this.cartCount = items.reduce((acc, i) => acc + i.quantity, 0);
    });
  }

  isAdmin(): boolean { return this.authService.isAdmin(); }

  logout(): void { this.authService.logout(); }
}