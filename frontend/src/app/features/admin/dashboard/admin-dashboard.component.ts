import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { ProductsService } from '../../../core/services/products.service';
import { NotificationsService } from '../../../core/services/notifications.service';
import { SaleNotification, Order, Product } from '../../../core/models/product.model';
import { environment } from '../../../../environments/environment';

// ══════════════════════════════════════════════════════════
// 1. MODAL DE NÚMERO DE GUÍA
// ══════════════════════════════════════════════════════════
@Component({
  selector: 'app-tracking-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule,
            MatFormFieldModule, MatInputModule, FormsModule],
  template: `
    <div class="tracking-dialog">
      <div class="dialog-header">
        <mat-icon>local_shipping</mat-icon>
        <h2>Registrar envío</h2>
      </div>
      <p class="dialog-subtitle">Ingresa el número de guía para marcar el pedido como enviado</p>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Número de seguimiento</mat-label>
        <input matInput [(ngModel)]="trackingNumber"
          placeholder="Ej: 1Z999AA10123456784"
          (keydown.enter)="confirm()">
        <mat-icon matSuffix>pin</mat-icon>
      </mat-form-field>
      <div class="dialog-actions">
        <button mat-stroked-button (click)="cancel()">Cancelar</button>
        <button mat-raised-button color="primary"
          [disabled]="!trackingNumber.trim()"
          (click)="confirm()">
          <mat-icon>send</mat-icon> Confirmar envío
        </button>
      </div>
    </div>
  `,
  styles: [`
    .tracking-dialog { padding: 1.5rem; width: 380px; }
    .dialog-header {
      display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;
      mat-icon { color: #059669; font-size: 2rem; width: 2rem; height: 2rem; }
      h2 { margin: 0; color: #064e3b; font-size: 1.25rem; }
    }
    .dialog-subtitle { color: #6b7280; margin: 0 0 1.25rem; font-size: 0.9rem; }
    .full-width { width: 100%; }
    .dialog-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem; }
  `]
})
export class TrackingDialogComponent {
  trackingNumber = '';
  constructor(
    private dialogRef: MatDialogRef<TrackingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
  confirm() { if (this.trackingNumber.trim()) this.dialogRef.close(this.trackingNumber.trim()); }
  cancel() { this.dialogRef.close(null); }
}

// ══════════════════════════════════════════════════════════
// 2. COMPONENTE PRINCIPAL DEL DASHBOARD
// ══════════════════════════════════════════════════════════
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatButtonModule,
    MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatTableModule, MatProgressSpinnerModule, MatSnackBarModule,
    MatChipsModule, MatSlideToggleModule, MatDialogModule, MatTooltipModule,
  ],
  template: `
    <div class="admin-layout">
      <aside class="sidebar">
        <div class="sidebar-brand">
          <mat-icon>storefront</mat-icon>
          <div>
            <span class="brand-name">MY SAFE SHOP</span>
            <span class="brand-role">Panel Admin</span>
          </div>
        </div>
        <div class="ws-status" [class.connected]="isConnected">
          <span class="status-dot"></span>
          {{ isConnected ? 'Tiempo Real Activo' : 'Reconectando...' }}
        </div>
        <nav class="sidebar-nav">
          <button class="nav-item" [class.active]="activeTab === 'notifications'"
            (click)="activeTab = 'notifications'">
            <mat-icon>notifications</mat-icon><span>Notificaciones</span>
            <span class="badge" *ngIf="notifications.length > 0">{{ notifications.length }}</span>
          </button>
          <button class="nav-item" [class.active]="activeTab === 'orders'"
            (click)="activeTab = 'orders'; loadOrders()">
            <mat-icon>receipt_long</mat-icon><span>Pedidos</span>
          </button>
          <button class="nav-item" [class.active]="activeTab === 'products'"
            (click)="activeTab = 'products'; loadProducts()">
            <mat-icon>inventory_2</mat-icon><span>Productos</span>
          </button>
          <button class="nav-item" [class.active]="activeTab === 'inventory'"
            (click)="activeTab = 'inventory'; loadInventory()">
            <mat-icon>assessment</mat-icon><span>Inventario</span>
          </button>
          <button class="nav-item" [class.active]="activeTab === 'upload'"
            (click)="activeTab = 'upload'">
            <mat-icon>add_photo_alternate</mat-icon><span>Publicar</span>
          </button>
        </nav>
      </aside>

      <main class="main-content">

        <!-- ══ Notificaciones ══ -->
        <div *ngIf="activeTab === 'notifications'" class="tab-content">
          <div class="tab-header">
            <h2><mat-icon>notifications_active</mat-icon> Ventas en Tiempo Real</h2>
            <button mat-stroked-button (click)="sendTestNotification()">
              <mat-icon>science</mat-icon> Probar
            </button>
          </div>
          <div *ngIf="notifications.length === 0" class="empty-state">
            <mat-icon>sensors</mat-icon>
            <h3>Esperando ventas...</h3>
            <p>Las notificaciones aparecerán aquí automáticamente</p>
            <button mat-raised-button color="accent" (click)="sendTestNotification()">
              Simular venta de prueba
            </button>
          </div>
          <div class="notification-card" *ngFor="let notif of notifications; let i = index"
            [class.first]="i === 0">
            <span class="notif-icon">💰</span>
            <div class="notif-body">
              <div class="notif-header">
                <strong>¡Nueva venta confirmada!</strong>
                <span>{{ notif.paidAt | date:'HH:mm:ss' }}</span>
              </div>
              <p>{{ notif.buyerName }} — {{ notif.buyerEmail }}</p>
              <p>{{ notif.products.join(', ') }}</p>
              <strong class="total-amount">{{ formatPrice(notif.total) }}</strong>
            </div>
          </div>
        </div>

        <!-- ══ Pedidos ══ -->
        <div *ngIf="activeTab === 'orders'" class="tab-content">
          <div class="tab-header">
            <h2><mat-icon>receipt_long</mat-icon> Pedidos Recientes</h2>
            <button mat-icon-button (click)="loadOrders()"><mat-icon>refresh</mat-icon></button>
          </div>
          <div class="orders-table-wrap">
            <table mat-table [dataSource]="recentOrders" class="orders-table">
              <ng-container matColumnDef="buyer">
                <th mat-header-cell *matHeaderCellDef>Comprador</th>
                <td mat-cell *matCellDef="let o">
                  <div>{{ o.buyerName }}</div>
                  <div class="small-text">{{ o.buyerEmail }}</div>
                </td>
              </ng-container>
              <ng-container matColumnDef="total">
                <th mat-header-cell *matHeaderCellDef>Total</th>
                <td mat-cell *matCellDef="let o"><strong>{{ formatPrice(o.total) }}</strong></td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Estado</th>
                <td mat-cell *matCellDef="let o">
                  <span class="status-chip"
                    [style.background]="getStatusColor(o.status) + '22'"
                    [style.color]="getStatusColor(o.status)">
                    {{ getStatusLabel(o.status) }}
                  </span>
                </td>
              </ng-container>
              <ng-container matColumnDef="items">
                <th mat-header-cell *matHeaderCellDef>Productos</th>
                <td mat-cell *matCellDef="let o">
                  <div *ngFor="let item of o.items" class="item-row">
                    <span class="item-chip">{{ item.product?.name | slice:0:20 }}</span>
                    <span class="units-badge">{{ item.quantity }} ud{{ item.quantity > 1 ? 's' : '' }}</span>
                  </div>
                </td>
              </ng-container>
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Fecha</th>
                <td mat-cell *matCellDef="let o">{{ o.createdAt | date:'dd/MM/yy HH:mm' }}</td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Acciones</th>
                <td mat-cell *matCellDef="let o">
                  <div class="action-buttons">
                    <button mat-icon-button color="primary"
                      *ngIf="o.status === 'PAID'"
                      (click)="markAsShipped(o.id)"
                      matTooltip="Marcar como enviado">
                      <mat-icon>local_shipping</mat-icon>
                    </button>
                    <button mat-icon-button color="accent"
                      *ngIf="o.status === 'SHIPPED'"
                      (click)="markAsDelivered(o.id)"
                      matTooltip="Marcar como entregado">
                      <mat-icon>done_all</mat-icon>
                    </button>
                    <button mat-icon-button color="warn"
                      *ngIf="o.status === 'PENDING' || o.status === 'PAID'"
                      (click)="markAsCancelled(o.id)"
                      matTooltip="Cancelar orden">
                      <mat-icon>cancel</mat-icon>
                    </button>
                  </div>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="orderColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: orderColumns;"></tr>
            </table>
            <p *ngIf="recentOrders.length === 0" class="empty-table">Sin pedidos aún</p>
          </div>
        </div>

        <!-- ══ Productos publicados ══ -->
        <div *ngIf="activeTab === 'products'" class="tab-content">
          <div *ngIf="editingProduct" class="edit-panel">
            <div class="edit-panel-header">
              <h3><mat-icon>edit</mat-icon> Editando: {{ editingProduct.name }}</h3>
              <button mat-icon-button (click)="cancelEdit()"><mat-icon>close</mat-icon></button>
            </div>
            <form [formGroup]="editForm" (ngSubmit)="saveEdit()" class="edit-form">
              <div class="edit-preview">
                <img [src]="editingProduct.imageUrl || 'https://via.placeholder.com/200'"
                  [alt]="editingProduct.name">
              </div>
              <div class="edit-fields">
                <mat-form-field appearance="outline">
                  <mat-label>Nombre</mat-label>
                  <input matInput formControlName="name">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Descripción</mat-label>
                  <textarea matInput formControlName="description" rows="3"></textarea>
                </mat-form-field>
                <div class="edit-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Precio (COP)</mat-label>
                    <input matInput formControlName="price" type="number">
                    <span matPrefix>$&nbsp;</span>
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Stock</mat-label>
                    <input matInput formControlName="stock" type="number">
                  </mat-form-field>
                </div>
                <div class="edit-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Marca</mat-label>
                    <input matInput formControlName="brand">
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Talla</mat-label>
                    <input matInput formControlName="size">
                  </mat-form-field>
                </div>
                <mat-form-field appearance="outline">
                  <mat-label>Condición</mat-label>
                  <mat-select formControlName="condition">
                    <mat-option value="NEW">Nuevo</mat-option>
                    <mat-option value="LIKE_NEW">Como Nuevo</mat-option>
                    <mat-option value="GOOD">Buen Estado</mat-option>
                    <mat-option value="FAIR">Aceptable</mat-option>
                  </mat-select>
                </mat-form-field>
                <div class="edit-actions">
                  <button mat-stroked-button type="button" (click)="cancelEdit()">Cancelar</button>
                  <button mat-raised-button type="submit" class="save-edit-btn" [disabled]="isSavingEdit">
                    <mat-spinner *ngIf="isSavingEdit" diameter="18"></mat-spinner>
                    <mat-icon *ngIf="!isSavingEdit">save</mat-icon>
                    {{ isSavingEdit ? 'Guardando...' : 'Guardar Cambios' }}
                  </button>
                </div>
              </div>
            </form>
          </div>
          <div class="tab-header">
            <h2><mat-icon>inventory_2</mat-icon> Productos Publicados</h2>
            <button mat-raised-button color="primary" (click)="activeTab = 'upload'">
              <mat-icon>add</mat-icon> Publicar nuevo
            </button>
          </div>
          <div *ngIf="isLoadingProducts" class="loading"><mat-spinner diameter="40"></mat-spinner></div>
          <div *ngIf="!isLoadingProducts" class="products-grid-admin">
            <mat-card *ngFor="let product of allProducts" class="product-admin-card"
              [class.editing]="editingProduct?.id === product.id">
              <div class="product-admin-img">
                <img [src]="product.imageUrl || 'https://via.placeholder.com/200'" [alt]="product.name">
                <span class="stock-pill" [class.low]="product.stock <= 1" [class.out]="product.stock === 0">
                  {{ product.stock === 0 ? 'Agotado' : product.stock + ' uds.' }}
                </span>
              </div>
              <mat-card-content class="product-admin-info">
                <p class="admin-brand">{{ product.brand }}</p>
                <h4 class="admin-name">{{ product.name }}</h4>
                <p class="admin-price">{{ formatPrice(product.price) }}</p>
                <p class="admin-size" *ngIf="product.size">Talla: {{ product.size }}</p>
              </mat-card-content>
              <mat-card-actions class="product-admin-actions">
                <button mat-icon-button color="primary" (click)="openEditProduct(product)" matTooltip="Editar">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteProduct(product.id)" matTooltip="Eliminar">
                  <mat-icon>delete</mat-icon>
                </button>
              </mat-card-actions>
            </mat-card>
          </div>
          <p *ngIf="!isLoadingProducts && allProducts.length === 0" class="empty-table">
            No hay productos publicados aún
          </p>
        </div>

        <!-- ══ Inventario ══ -->
        <div *ngIf="activeTab === 'inventory'" class="tab-content">
          <div class="tab-header">
            <h2><mat-icon>assessment</mat-icon> Inventario</h2>
            <button mat-icon-button (click)="loadInventory()"><mat-icon>refresh</mat-icon></button>
          </div>

          <!-- Métricas rápidas -->
          <div class="inventory-metrics">
            <div class="metric-card">
              <mat-icon>inventory_2</mat-icon>
              <div>
                <span class="metric-value">{{ inventoryProducts.length }}</span>
                <span class="metric-label">Total productos</span>
              </div>
            </div>
            <div class="metric-card active">
              <mat-icon>check_circle</mat-icon>
              <div>
                <span class="metric-value">{{ getActiveCount() }}</span>
                <span class="metric-label">Disponibles</span>
              </div>
            </div>
            <div class="metric-card warning">
              <mat-icon>warning</mat-icon>
              <div>
                <span class="metric-value">{{ getLowStockCount() }}</span>
                <span class="metric-label">Stock bajo (≤1)</span>
              </div>
            </div>
            <div class="metric-card danger">
              <mat-icon>remove_shopping_cart</mat-icon>
              <div>
                <span class="metric-value">{{ getOutOfStockCount() }}</span>
                <span class="metric-label">Agotados</span>
              </div>
            </div>
            <div class="metric-card total">
              <mat-icon>attach_money</mat-icon>
              <div>
                <span class="metric-value">{{ formatPrice(getTotalInventoryValue()) }}</span>
                <span class="metric-label">Valor total</span>
              </div>
            </div>
          </div>

          <!-- Tabla de inventario -->
          <div class="inventory-table-wrap" *ngIf="!isLoadingInventory">
            <table mat-table [dataSource]="inventoryProducts" class="inventory-table">
              <ng-container matColumnDef="product">
                <th mat-header-cell *matHeaderCellDef>Producto</th>
                <td mat-cell *matCellDef="let p">
                  <div class="inv-product">
                    <img [src]="p.imageUrl || 'https://via.placeholder.com/40'" [alt]="p.name">
                    <div>
                      <div class="inv-name">{{ p.name }}</div>
                      <div class="inv-brand">{{ p.brand || '—' }}</div>
                    </div>
                  </div>
                </td>
              </ng-container>
              <ng-container matColumnDef="category">
                <th mat-header-cell *matHeaderCellDef>Categoría</th>
                <td mat-cell *matCellDef="let p">{{ p.category?.name || '—' }}</td>
              </ng-container>
              <ng-container matColumnDef="size">
                <th mat-header-cell *matHeaderCellDef>Talla</th>
                <td mat-cell *matCellDef="let p">{{ p.size || '—' }}</td>
              </ng-container>
              <ng-container matColumnDef="condition">
                <th mat-header-cell *matHeaderCellDef>Condición</th>
                <td mat-cell *matCellDef="let p">
                  <span class="condition-badge condition-{{ p.condition?.toLowerCase() }}">
                    {{ getConditionLabel(p.condition) }}
                  </span>
                </td>
              </ng-container>
              <ng-container matColumnDef="price">
                <th mat-header-cell *matHeaderCellDef>Precio</th>
                <td mat-cell *matCellDef="let p"><strong>{{ formatPrice(p.price) }}</strong></td>
              </ng-container>
              <ng-container matColumnDef="stock">
                <th mat-header-cell *matHeaderCellDef>Stock</th>
                <td mat-cell *matCellDef="let p">
                  <span class="stock-badge"
                    [class.stock-ok]="p.stock > 1"
                    [class.stock-low]="p.stock === 1"
                    [class.stock-out]="p.stock === 0">
                    {{ p.stock === 0 ? 'Agotado' : p.stock + ' uds.' }}
                  </span>
                </td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Estado</th>
                <td mat-cell *matCellDef="let p">
                  <span class="status-badge-inv" [class.active]="p.isActive" [class.inactive]="!p.isActive">
                    {{ p.isActive ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="inventoryColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: inventoryColumns;"></tr>
            </table>
            <p *ngIf="inventoryProducts.length === 0" class="empty-table">Sin productos en inventario</p>
          </div>
          <div *ngIf="isLoadingInventory" class="loading"><mat-spinner diameter="40"></mat-spinner></div>
        </div>

        <!-- ══ Publicar Producto ══ -->
        <div *ngIf="activeTab === 'upload'" class="tab-content">
          <div class="tab-header">
            <h2><mat-icon>add_photo_alternate</mat-icon> Publicar Nuevo Producto</h2>
          </div>
          <div class="upload-layout">
            <div class="image-zone">
              <div class="drop-area" (click)="fileInput.click()">
                <div *ngIf="!previewUrl" class="drop-placeholder">
                  <mat-icon>cloud_upload</mat-icon>
                  <p>Clic para subir foto</p>
                  <small>JPEG, PNG — máx 10MB</small>
                </div>
                <img *ngIf="previewUrl" [src]="previewUrl" class="preview-img">
              </div>
              <input #fileInput type="file" accept="image/*" hidden (change)="onFileSelected($event)">
              <button mat-stroked-button *ngIf="previewUrl" (click)="fileInput.click()" class="change-photo-btn">
                <mat-icon>swap_horiz</mat-icon> Cambiar foto
              </button>
            </div>
            <form [formGroup]="productForm" class="product-form" (ngSubmit)="onSubmitProduct()">
              <mat-form-field appearance="outline">
                <mat-label>Nombre del artículo</mat-label>
                <input matInput formControlName="name" placeholder="Ej: Abrigo de Lana Zara">
                <mat-error>El nombre es requerido</mat-error>
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Descripción</mat-label>
                <textarea matInput formControlName="description" rows="3"
                  placeholder="Describe el artículo: estado, detalles..."></textarea>
                <mat-error>La descripción es requerida</mat-error>
              </mat-form-field>
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Precio (COP)</mat-label>
                  <input matInput formControlName="price" type="number">
                  <span matPrefix>$&nbsp;</span>
                  <mat-error>Precio mínimo $1.000</mat-error>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Stock</mat-label>
                  <input matInput formControlName="stock" type="number">
                </mat-form-field>
              </div>
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Marca</mat-label>
                  <input matInput formControlName="brand">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Talla</mat-label>
                  <input matInput formControlName="size">
                </mat-form-field>
              </div>
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Condición</mat-label>
                  <mat-select formControlName="condition">
                    <mat-option value="NEW">Nuevo</mat-option>
                    <mat-option value="LIKE_NEW">Como Nuevo</mat-option>
                    <mat-option value="GOOD">Buen Estado</mat-option>
                    <mat-option value="FAIR">Aceptable</mat-option>
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Categoría</mat-label>
                  <mat-select formControlName="categoryId">
                    <mat-option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</mat-option>
                  </mat-select>
                  <mat-error>Selecciona una categoría</mat-error>
                </mat-form-field>
              </div>
              <button mat-raised-button color="primary" type="submit" [disabled]="isUploading" class="submit-btn">
                <mat-spinner *ngIf="isUploading" diameter="20"></mat-spinner>
                <mat-icon *ngIf="!isUploading">publish</mat-icon>
                {{ isUploading ? 'Publicando...' : 'Publicar Producto' }}
              </button>
            </form>
          </div>
        </div>

      </main>
    </div>
  `,
  styles: [`
    .admin-layout { display: flex; min-height: calc(100vh - 64px); background: #f0fdf4; }
    .sidebar {
      width: 200px; background: #064e3b; color: white;
      padding: 1.5rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; flex-shrink: 0;
    }
    .action-buttons { display: flex; gap: 0.25rem; align-items: center; }
    .sidebar-brand {
      display: flex; align-items: center; gap: 0.75rem;
      padding-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1);
      mat-icon { color: #6ee7b7; font-size: 2rem; }
      .brand-name { display: block; font-weight: 700; font-size: 0.95rem; }
      .brand-role { display: block; font-size: 0.75rem; color: #6ee7b7; }
    }
    .ws-status {
      display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem;
      color: #ef4444; background: rgba(239,68,68,0.1); padding: 0.5rem 1rem; border-radius: 8px;
      .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #ef4444; }
      &.connected { color: #10b981; background: rgba(16,185,129,0.1);
        .status-dot { background: #10b981; animation: pulse 2s infinite; } }
    }
    .sidebar-nav { display: flex; flex-direction: column; gap: 0.25rem; }
    .nav-item {
      display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem;
      border: none; background: transparent; color: rgba(255,255,255,0.7);
      border-radius: 8px; cursor: pointer; font-size: 0.9rem; text-align: left; width: 100%;
      &:hover { background: rgba(255,255,255,0.08); color: white; }
      &.active { background: rgba(5,150,105,0.3); color: #a7f3d0; }
      .badge { margin-left: auto; background: #059669; color: white;
        border-radius: 99px; padding: 1px 8px; font-size: 0.75rem; }
    }
    .main-content { flex: 1; padding: 2rem; overflow-y: auto; }
    .tab-content { max-width: 1100px; }
    .tab-header {
      display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;
      h2 { display: flex; align-items: center; gap: 0.5rem; font-size: 1.5rem;
        color: #064e3b; margin: 0; mat-icon { color: #059669; } }
    }
    .loading { display: flex; justify-content: center; padding: 3rem; }
    .empty-state { text-align: center; padding: 4rem;
      mat-icon { font-size: 3.5rem; width: 3.5rem; height: 3.5rem; color: #059669; }
      h3 { color: #374151; } p { color: #6b7280; margin-bottom: 1.5rem; } }
    .notification-card {
      display: flex; gap: 1rem; background: white; border-radius: 12px;
      padding: 1.25rem; margin-bottom: 1rem; border-left: 4px solid #10b981;
      animation: slideIn 0.4s ease;
      &.first { border-left-color: #059669; }
      .notif-icon { font-size: 2rem; }
      .notif-body { flex: 1; }
      .notif-header { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
      .total-amount { color: #10b981; font-size: 1.1rem; }
    }

    /* Pedidos */
    .orders-table-wrap { background: white; border-radius: 12px; overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .orders-table { width: 100%; }
    .small-text { font-size: 0.8rem; color: #9ca3af; }
    .status-chip { padding: 3px 12px; border-radius: 99px; font-size: 0.8rem; font-weight: 600; }
    .item-row { display: flex; align-items: center; gap: 0.4rem; margin: 2px 0; }
    .item-chip { display: inline-block; background: #d1fae5; color: #059669;
      font-size: 0.75rem; padding: 2px 8px; border-radius: 99px; }
    .units-badge { display: inline-block; background: #dbeafe; color: #1e40af;
      font-size: 0.7rem; font-weight: 700; padding: 1px 7px; border-radius: 99px; }
    .empty-table { text-align: center; padding: 2rem; color: #6b7280; }

    /* Inventario — métricas */
    .inventory-metrics {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 1rem; margin-bottom: 1.5rem;
    }
    .metric-card {
      background: white; border-radius: 12px; padding: 1rem 1.25rem;
      display: flex; align-items: center; gap: 0.75rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08); border-left: 4px solid #d1d5db;
      mat-icon { font-size: 2rem; width: 2rem; height: 2rem; color: #9ca3af; }
      .metric-value { display: block; font-size: 1.4rem; font-weight: 800; color: #064e3b; }
      .metric-label { display: block; font-size: 0.75rem; color: #6b7280; }
      &.active { border-left-color: #10b981; mat-icon { color: #10b981; } }
      &.warning { border-left-color: #f59e0b; mat-icon { color: #f59e0b; } }
      &.danger { border-left-color: #ef4444; mat-icon { color: #ef4444; } }
      &.total { border-left-color: #6366f1; mat-icon { color: #6366f1; }
        .metric-value { font-size: 1rem; } }
    }

    /* Inventario — tabla */
    .inventory-table-wrap { background: white; border-radius: 12px; overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .inventory-table { width: 100%; }
    .inv-product { display: flex; align-items: center; gap: 0.75rem;
      img { width: 40px; height: 40px; object-fit: cover; border-radius: 8px; flex-shrink: 0; }
      .inv-name { font-weight: 600; font-size: 0.9rem; }
      .inv-brand { font-size: 0.75rem; color: #9ca3af; }
    }
    .condition-badge { padding: 2px 10px; border-radius: 99px; font-size: 0.75rem; font-weight: 600; }
    .condition-new { background: #d1fae5; color: #065f46; }
    .condition-like_new { background: #dbeafe; color: #1e40af; }
    .condition-good { background: #fef3c7; color: #d97706; }
    .condition-fair { background: #fee2e2; color: #dc2626; }
    .stock-badge { padding: 3px 10px; border-radius: 99px; font-size: 0.8rem; font-weight: 700; }
    .stock-ok { background: #d1fae5; color: #065f46; }
    .stock-low { background: #fef3c7; color: #d97706; }
    .stock-out { background: #fee2e2; color: #dc2626; }
    .status-badge-inv { padding: 3px 10px; border-radius: 99px; font-size: 0.8rem; font-weight: 600; }
    .status-badge-inv.active { background: #d1fae5; color: #065f46; }
    .status-badge-inv.inactive { background: #f3f4f6; color: #6b7280; }

    /* Productos */
    .edit-panel {
      background: white; border-radius: 16px; padding: 1.5rem;
      margin-bottom: 1.5rem; border: 2px solid #10b981;
      box-shadow: 0 4px 20px rgba(16,185,129,0.15); animation: slideIn 0.3s ease;
    }
    .edit-panel-header {
      display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem;
      h3 { display: flex; align-items: center; gap: 0.5rem; margin: 0; color: #064e3b; font-size: 1.1rem;
        mat-icon { color: #059669; } }
    }
    .edit-form { display: grid; grid-template-columns: 160px 1fr; gap: 1.5rem; }
    .edit-preview { img { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 12px; } }
    .edit-fields { display: flex; flex-direction: column; gap: 0.5rem; mat-form-field { width: 100%; } }
    .edit-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .edit-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem; }
    .save-edit-btn {
      background: linear-gradient(135deg, #059669, #10b981) !important;
      color: white !important; display: flex; align-items: center; gap: 0.5rem;
      height: 44px; padding: 0 1.5rem;
    }
    .products-grid-admin { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
    .product-admin-card { border-radius: 12px !important; overflow: hidden; transition: box-shadow 0.2s;
      &.editing { box-shadow: 0 0 0 2px #10b981 !important; } }
    .product-admin-img {
      position: relative; height: 160px; background: #f3f4f6;
      img { width: 100%; height: 100%; object-fit: cover; }
      .stock-pill { position: absolute; bottom: 8px; right: 8px; font-size: 0.75rem; font-weight: 700;
        padding: 2px 10px; border-radius: 99px; background: #d1fae5; color: #065f46;
        &.low { background: #fef3c7; color: #d97706; }
        &.out { background: #fee2e2; color: #dc2626; } }
    }
    .product-admin-info { padding: 0.75rem 1rem !important;
      .admin-brand { font-size: 0.75rem; color: #9ca3af; text-transform: uppercase; margin: 0; }
      .admin-name { font-size: 0.9rem; font-weight: 600; margin: 0.25rem 0; }
      .admin-price { color: #059669; font-weight: 700; margin: 0; }
      .admin-size { font-size: 0.8rem; color: #6b7280; margin: 0.25rem 0 0; }
    }
    .product-admin-actions { display: flex; justify-content: flex-end; gap: 0.25rem; padding: 0 0.5rem 0.5rem; }

    /* Upload */
    .upload-layout { display: grid; grid-template-columns: 280px 1fr; gap: 2rem; }
    .image-zone { display: flex; flex-direction: column; gap: 0.75rem; }
    .drop-area {
      width: 100%; aspect-ratio: 1; border: 2px dashed #a7f3d0; border-radius: 12px;
      display: flex; align-items: center; justify-content: center; cursor: pointer;
      background: #f0fdf4; transition: all 0.2s; overflow: hidden;
      &:hover { border-color: #059669; background: #d1fae5; }
      .drop-placeholder { text-align: center; color: #9ca3af;
        mat-icon { font-size: 3rem; width: 3rem; height: 3rem; color: #a7f3d0; }
        p { margin: 0.5rem 0 0.25rem; font-weight: 500; }
        small { font-size: 0.75rem; } }
      .preview-img { width: 100%; height: 100%; object-fit: cover; }
    }
    .change-photo-btn { width: 100%; }
    .product-form { display: flex; flex-direction: column; gap: 0.5rem; mat-form-field { width: 100%; } }
    .full-width { width: 100%; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .submit-btn {
      height: 52px; font-size: 1rem; font-weight: 700;
      display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-top: 0.5rem;
    }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
    @keyframes slideIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  activeTab = 'notifications';
  isConnected = false;
  isUploading = false;
  isLoadingProducts = false;
  isLoadingInventory = false;
  isSavingEdit = false;
  editingProduct: Product | null = null;
  notifications: SaleNotification[] = [];
  recentOrders: Order[] = [];
  allProducts: Product[] = [];
  inventoryProducts: any[] = [];
  productForm: FormGroup;
  editForm: FormGroup;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  categories: any[] = [];
  orderColumns = ['buyer', 'total', 'status', 'items', 'date', 'actions'];
  inventoryColumns = ['product', 'category', 'size', 'condition', 'price', 'stock', 'status'];
  private subs = new Subscription();

  constructor(
    private fb: FormBuilder,
    private productsService: ProductsService,
    private notificationsService: NotificationsService,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {
    this.productForm = this.fb.group({
      name:        ['', Validators.required],
      description: ['', Validators.required],
      price:       ['', [Validators.required, Validators.min(1000)]],
      stock:       [1, Validators.required],
      size:        [''],
      brand:       [''],
      condition:   ['GOOD', Validators.required],
      categoryId:  ['', Validators.required],
    });
    this.editForm = this.fb.group({
      name:        ['', Validators.required],
      description: ['', Validators.required],
      price:       ['', [Validators.required, Validators.min(1000)]],
      stock:       [1, Validators.required],
      brand:       [''],
      size:        [''],
      condition:   ['GOOD', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadOrders();
    this.subs.add(
      this.notificationsService.onNewSale().subscribe(notification => {
        this.notifications.unshift(notification);
        this.snackBar.open(
          `💰 ¡Nueva venta! ${notification.buyerName} — ${this.formatPrice(notification.total)}`,
          'Ver', { duration: 8000 }
        );
        this.loadOrders();
      })
    );
    this.subs.add(
      this.notificationsService.onConnectionChange().subscribe(connected => {
        this.isConnected = connected;
      })
    );
  }

  ngOnDestroy(): void { this.subs.unsubscribe(); }

  loadCategories(): void {
    this.subs.add(this.productsService.getCategories().subscribe({ next: cats => this.categories = cats }));
  }

  loadOrders(): void {
    this.subs.add(
      this.http.get<Order[]>(`${environment.apiUrl}/orders`).subscribe({
        next: orders => this.recentOrders = orders,
        error: () => {}
      })
    );
  }

  loadProducts(): void {
    this.isLoadingProducts = true;
    this.subs.add(
      this.http.get<any>(`${environment.apiUrl}/products?limit=100`).subscribe({
        next: (res) => { this.allProducts = res.products; this.isLoadingProducts = false; },
        error: () => { this.isLoadingProducts = false; }
      })
    );
  }

  loadInventory(): void {
    this.isLoadingInventory = true;
    this.subs.add(
      this.http.get<any>(`${environment.apiUrl}/products?limit=200`).subscribe({
        next: (res) => { this.inventoryProducts = res.products; this.isLoadingInventory = false; },
        error: () => { this.isLoadingInventory = false; }
      })
    );
  }

  // ── Métricas de inventario ──
  getActiveCount(): number { return this.inventoryProducts.filter(p => p.isActive && p.stock > 0).length; }
  getLowStockCount(): number { return this.inventoryProducts.filter(p => p.stock === 1).length; }
  getOutOfStockCount(): number { return this.inventoryProducts.filter(p => p.stock === 0).length; }
  getTotalInventoryValue(): number {
    return this.inventoryProducts.reduce((sum, p) => sum + (Number(p.price) * p.stock), 0);
  }

  getConditionLabel(condition: string): string {
    const labels: Record<string, string> = {
      NEW: 'Nuevo', LIKE_NEW: 'Como Nuevo', GOOD: 'Buen Estado', FAIR: 'Aceptable'
    };
    return labels[condition] || condition;
  }

  openEditProduct(product: Product): void {
    this.editingProduct = product;
    this.editForm.patchValue({
      name: product.name, description: product.description || '',
      price: product.price, stock: product.stock,
      brand: product.brand || '', size: product.size || '', condition: product.condition,
    });
    setTimeout(() => document.querySelector('.edit-panel')?.scrollIntoView({ behavior: 'smooth' }), 100);
  }

  cancelEdit(): void { this.editingProduct = null; this.editForm.reset(); }

  saveEdit(): void {
    if (this.editForm.invalid || !this.editingProduct) return;
    this.isSavingEdit = true;
    this.subs.add(
      this.http.put(`${environment.apiUrl}/products/${this.editingProduct.id}`, this.editForm.value).subscribe({
        next: () => {
          this.isSavingEdit = false;
          this.snackBar.open('✅ Producto actualizado correctamente', 'OK', { duration: 3000 });
          this.editingProduct = null; this.editForm.reset(); this.loadProducts();
        },
        error: () => { this.isSavingEdit = false; this.snackBar.open('Error al actualizar', 'OK', { duration: 3000 }); },
      })
    );
  }

  deleteProduct(id: string): void {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    this.subs.add(
      this.productsService.deleteProduct(id).subscribe({
        next: () => { this.snackBar.open('Producto eliminado', 'OK', { duration: 3000 }); this.loadProducts(); },
        error: () => this.snackBar.open('Error al eliminar', 'OK', { duration: 3000 }),
      })
    );
  }

  markAsShipped(orderId: string): void {
    const ref = this.dialog.open(TrackingDialogComponent, { width: '420px', disableClose: true });
    ref.afterClosed().subscribe(trackingNumber => {
      if (!trackingNumber) return;
      this.subs.add(
        this.http.patch(`${environment.apiUrl}/orders/${orderId}/ship`, { trackingNumber }).subscribe({
          next: () => { this.snackBar.open('📦 Orden marcada como enviada', 'OK', { duration: 3000 }); this.loadOrders(); },
          error: () => this.snackBar.open('Error al actualizar', 'OK', { duration: 3000 }),
        })
      );
    });
  }

  markAsDelivered(orderId: string): void {
    if (!confirm('¿Marcar esta orden como entregada?')) return;
    this.subs.add(
      this.http.patch(`${environment.apiUrl}/orders/${orderId}/deliver`, {}).subscribe({
        next: () => { this.snackBar.open('✅ Orden marcada como entregada', 'OK', { duration: 3000 }); this.loadOrders(); },
        error: () => this.snackBar.open('Error al actualizar', 'OK', { duration: 3000 }),
      })
    );
  }

  markAsCancelled(orderId: string): void {
    if (!confirm('¿Cancelar esta orden? Esta acción no se puede deshacer.')) return;
    this.subs.add(
      this.http.patch(`${environment.apiUrl}/orders/${orderId}/cancel`, {}).subscribe({
        next: () => { this.snackBar.open('Orden cancelada', 'OK', { duration: 3000 }); this.loadOrders(); },
        error: () => this.snackBar.open('Error al cancelar', 'OK', { duration: 3000 }),
      })
    );
  }

  sendTestNotification(): void { this.notificationsService.testNotification(); }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => this.previewUrl = e.target.result;
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onSubmitProduct(): void {
    if (this.productForm.invalid) { this.productForm.markAllAsTouched(); return; }
    if (!this.selectedFile) { this.snackBar.open('Selecciona una imagen del producto', 'OK', { duration: 3000 }); return; }
    this.isUploading = true;
    const formData = new FormData();
    formData.append('image', this.selectedFile);
    const values = this.productForm.value;
    formData.append('name', values.name);
    formData.append('description', values.description);
    formData.append('price', Number(values.price).toString());
    formData.append('stock', Number(values.stock).toString());
    formData.append('brand', values.brand || '');
    formData.append('size', values.size || '');
    formData.append('condition', values.condition);
    formData.append('categoryId', values.categoryId);
    this.subs.add(
      this.productsService.createProductWithImage(formData).subscribe({
        next: (res) => {
          this.isUploading = false;
          this.snackBar.open(`✅ "${res.product.name}" publicado exitosamente`, 'OK', { duration: 4000 });
          this.productForm.reset({ stock: 1, condition: 'GOOD' });
          this.selectedFile = null; this.previewUrl = null;
          this.activeTab = 'products'; this.loadProducts();
        },
        error: (err) => { this.isUploading = false; this.snackBar.open(err.error?.message || 'Error al publicar', 'Cerrar', { duration: 5000 }); },
      })
    );
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price);
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      PENDING: '#f59e0b', PAID: '#10b981', SHIPPED: '#3b82f6', DELIVERED: '#6b7280', CANCELLED: '#ef4444',
    };
    return colors[status] || '#6b7280';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'Pendiente', PAID: 'Pagado', SHIPPED: 'Enviado', DELIVERED: 'Entregado', CANCELLED: 'Cancelado',
    };
    return labels[status] || status;
  }
}