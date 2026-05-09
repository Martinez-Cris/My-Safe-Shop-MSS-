import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { CartService } from './core/services/cart.service';
import { AuthService, User } from './core/services/auth.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive, AsyncPipe,
    MatToolbarModule, MatButtonModule, MatIconModule,
    MatBadgeModule, MatMenuModule, MatDividerModule,
  ],
  template: `
    <mat-toolbar class="navbar" *ngIf="isLoggedIn">
      <a routerLink="/shop" class="brand">
        <mat-icon>storefront</mat-icon>
        MY SAFE SHOP
      </a>
      <span class="spacer"></span>

      <a mat-button routerLink="/shop" routerLinkActive="active-link">
        <mat-icon>storefront</mat-icon> Tienda
      </a>

      <ng-container *ngIf="!isAdmin">
        <a mat-button routerLink="/cart" routerLinkActive="active-link">
          <mat-icon [matBadge]="(cartService.count$ | async)?.toString()"
            matBadgeColor="warn"
            [matBadgeHidden]="(cartService.count$ | async) === 0">
            shopping_cart
          </mat-icon>
          Carrito
        </a>
        <a mat-button routerLink="/mis-pedidos" routerLinkActive="active-link">
          <mat-icon>receipt_long</mat-icon> Mis Pedidos
        </a>
      </ng-container>

      <a mat-button routerLink="/admin" routerLinkActive="active-link" *ngIf="isAdmin">
        <mat-icon>dashboard</mat-icon> Panel Admin
      </a>

      <button mat-button [matMenuTriggerFor]="userMenu" class="user-btn">
        <mat-icon>account_circle</mat-icon>
        {{ currentUser?.name }}
        <mat-icon>arrow_drop_down</mat-icon>
      </button>

      <mat-menu #userMenu="matMenu">
        <div class="user-info-menu">
          <p class="user-name">{{ currentUser?.name }}</p>
          <p class="user-email">{{ currentUser?.email }}</p>
          <span class="role-badge" [class.admin]="isAdmin">
            {{ isAdmin ? 'Administrador' : 'Cliente' }}
          </span>
        </div>
        <mat-divider></mat-divider>
        <button mat-menu-item (click)="logout()">
          <mat-icon>logout</mat-icon> Cerrar sesión
        </button>
      </mat-menu>
    </mat-toolbar>

    <router-outlet></router-outlet>
  `,
  styles: [`
    .navbar {
      background: #1a1033 !important;
      color: white;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .brand {
      display: flex; align-items: center; gap: 0.5rem;
      color: white; text-decoration: none; font-weight: 700; font-size: 1.1rem;
    }
    .spacer { flex: 1; }
    a[mat-button] { color: rgba(255,255,255,0.8) !important; }
    .active-link { color: #c4b5fd !important; }
    .user-btn {
      color: rgba(255,255,255,0.8) !important;
      display: flex; align-items: center; gap: 0.25rem; margin-left: 0.5rem;
    }
    .user-info-menu {
      padding: 12px 16px;
      .user-name { font-weight: 600; margin: 0; font-size: 0.9rem; }
      .user-email { color: #6b7280; font-size: 0.8rem; margin: 2px 0 6px; }
      .role-badge {
        background: #f3e8ff; color: #7c3aed;
        font-size: 0.7rem; font-weight: 700; padding: 2px 10px; border-radius: 99px;
        &.admin { background: #fef3c7; color: #d97706; }
      }
    }
  `]
})
export class AppComponent implements OnInit {
  isLoggedIn = false;
  isAdmin = false;
  currentUser: User | null = null;

  constructor(
    public cartService: CartService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
      this.isLoggedIn = !!user;
      this.isAdmin = user?.role === 'ADMIN';
    });

    this.authService.isLoggedIn$.subscribe(loggedIn => {
      this.isLoggedIn = loggedIn;
    });
  }

  logout(): void {
    this.authService.logout();
  }
}