import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'shop',
    canActivate: [authGuard],
    loadComponent: () => import('./features/shop/product-list/product-list.component').then(m => m.ProductListComponent)
  },
  {
    path: 'shop/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/shop/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
  },
  {
    path: 'cart',
    canActivate: [authGuard],
    loadComponent: () => import('./features/shop/cart/cart.component').then(m => m.CartComponent)
  },
  {
    path: 'mis-pedidos',
    canActivate: [authGuard],
    loadComponent: () => import('./features/orders/my-orders.component').then(m => m.MyOrdersComponent)
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
  },
  {
    path: 'checkout/success',
    canActivate: [authGuard],
    loadComponent: () => import('./features/checkout/success/success.component').then(m => m.CheckoutSuccessComponent)
  },
  {
    path: 'checkout/cancel',
    canActivate: [authGuard],
    loadComponent: () => import('./features/checkout/cancel/cancel.component').then(m => m.CheckoutCancelComponent)
  },
  { path: '**', redirectTo: 'login' }
];