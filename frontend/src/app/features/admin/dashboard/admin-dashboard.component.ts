import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { ProductsService } from '../../../core/services/products.service';
import { NotificationsService } from '../../../core/services/notifications.service';
import { SaleNotification, Order, Product } from '../../../core/models/product.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatButtonModule,
    MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatTableModule, MatProgressSpinnerModule, MatSnackBarModule,
    MatChipsModule, MatSlideToggleModule,
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
                  <span *ngFor="let item of o.items" class="item-chip">
                    {{ item.product?.name | slice:0:20 }}
                  </span>
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
      <!-- PENDIENTE → no hay acción de pago manual, el webhook lo hace -->
      
      <!-- PAGADO → marcar como enviado -->
      <button mat-icon-button color="primary"
        *ngIf="o.status === 'PAID'"
        (click)="markAsShipped(o.id)"
        matTooltip="Marcar como enviado">
        <mat-icon>local_shipping</mat-icon>
      </button>

      <!-- ENVIADO → marcar como entregado -->
      <button mat-icon-button color="accent"
        *ngIf="o.status === 'SHIPPED'"
        (click)="markAsDelivered(o.id)"
        matTooltip="Marcar como entregado">
        <mat-icon>done_all</mat-icon>
      </button>

      <!-- PENDIENTE o PAGADO → cancelar -->
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
          <div class="tab-header">
            <h2><mat-icon>inventory_2</mat-icon> Productos Publicados</h2>
            <button mat-raised-button color="primary" (click)="activeTab = 'upload'">
              <mat-icon>add</mat-icon> Publicar nuevo
            </button>
          </div>
          <div *ngIf="isLoadingProducts" class="loading">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
          <div *ngIf="!isLoadingProducts" class="products-grid-admin">
            <mat-card *ngFor="let product of allProducts" class="product-admin-card">
              <div class="product-admin-img">
                <img [src]="product.imageUrl || 'https://via.placeholder.com/200'"
                  [alt]="product.name">
                <span class="stock-pill" [class.low]="product.stock <= 1"
                  [class.out]="product.stock === 0">
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
                <button mat-icon-button color="warn"
                  (click)="deleteProduct(product.id)"
                  matTooltip="Eliminar producto">
                  <mat-icon>delete</mat-icon>
                </button>
              </mat-card-actions>
            </mat-card>
          </div>
          <p *ngIf="!isLoadingProducts && allProducts.length === 0" class="empty-table">
            No hay productos publicados aún
          </p>
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
              <input #fileInput type="file" accept="image/*" hidden
                (change)="onFileSelected($event)">
              <button mat-stroked-button *ngIf="previewUrl" (click)="fileInput.click()"
                class="change-photo-btn">
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
                    <mat-option *ngFor="let cat of categories" [value]="cat.id">
                      {{ cat.name }}
                    </mat-option>
                  </mat-select>
                  <mat-error>Selecciona una categoría</mat-error>
                </mat-form-field>
              </div>

              <button mat-raised-button color="primary" type="submit"
                [disabled]="isUploading" class="submit-btn">
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
    .admin-layout { display: flex; min-height: calc(100vh - 64px); background: #f8f7ff; }
    .sidebar {
      width: 200px; background: #1a1033; color: white;
      padding: 1.5rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; flex-shrink: 0;
    }
    .action-buttons { display: flex; gap: 0.25rem; align-items: center; }
    .sidebar-brand {
      display: flex; align-items: center; gap: 0.75rem;
      padding-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1);
      mat-icon { color: #a78bfa; font-size: 2rem; }
      .brand-name { display: block; font-weight: 700; font-size: 0.95rem; }
      .brand-role { display: block; font-size: 0.75rem; color: #a78bfa; }
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
      &.active { background: rgba(124,58,237,0.3); color: #c4b5fd; }
      .badge { margin-left: auto; background: #7c3aed; color: white;
        border-radius: 99px; padding: 1px 8px; font-size: 0.75rem; }
    }
    .main-content { flex: 1; padding: 2rem; overflow-y: auto; }
    .tab-content { max-width: 1000px; }
    .tab-header {
      display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;
      h2 { display: flex; align-items: center; gap: 0.5rem; font-size: 1.5rem;
        color: #1a1033; margin: 0; mat-icon { color: #7c3aed; } }
    }
    .loading { display: flex; justify-content: center; padding: 3rem; }
    .empty-state { text-align: center; padding: 4rem;
      mat-icon { font-size: 3.5rem; width: 3.5rem; height: 3.5rem; color: #7c3aed; }
      h3 { color: #374151; } p { color: #6b7280; margin-bottom: 1.5rem; } }
    .notification-card {
      display: flex; gap: 1rem; background: white; border-radius: 12px;
      padding: 1.25rem; margin-bottom: 1rem; border-left: 4px solid #10b981;
      animation: slideIn 0.4s ease;
      &.first { border-left-color: #7c3aed; }
      .notif-icon { font-size: 2rem; }
      .notif-body { flex: 1; }
      .notif-header { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
      .total-amount { color: #10b981; font-size: 1.1rem; }
    }
    .orders-table-wrap { background: white; border-radius: 12px; overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .orders-table { width: 100%; }
    .small-text { font-size: 0.8rem; color: #9ca3af; }
    .status-chip { padding: 3px 12px; border-radius: 99px; font-size: 0.8rem; font-weight: 600; }
    .item-chip { display: inline-block; background: #f3e8ff; color: #7c3aed;
      font-size: 0.75rem; padding: 2px 8px; border-radius: 99px; margin: 2px; }
    .empty-table { text-align: center; padding: 2rem; color: #6b7280; }

    .products-grid-admin {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;
    }
    .product-admin-card { border-radius: 12px !important; overflow: hidden; }
    .product-admin-img {
      position: relative; height: 160px; background: #f3f4f6;
      img { width: 100%; height: 100%; object-fit: cover; }
      .stock-pill {
        position: absolute; bottom: 8px; right: 8px; font-size: 0.75rem; font-weight: 700;
        padding: 2px 10px; border-radius: 99px; background: #d1fae5; color: #065f46;
        &.low { background: #fef3c7; color: #d97706; }
        &.out { background: #fee2e2; color: #dc2626; }
      }
    }
    .product-admin-info { padding: 0.75rem 1rem !important;
      .admin-brand { font-size: 0.75rem; color: #9ca3af; text-transform: uppercase; margin: 0; }
      .admin-name { font-size: 0.9rem; font-weight: 600; margin: 0.25rem 0; }
      .admin-price { color: #7c3aed; font-weight: 700; margin: 0; }
      .admin-size { font-size: 0.8rem; color: #6b7280; margin: 0.25rem 0 0; }
    }
    .product-admin-actions { display: flex; justify-content: flex-end; padding: 0 0.5rem 0.5rem; }

    .upload-layout { display: grid; grid-template-columns: 280px 1fr; gap: 2rem; }
    .image-zone { display: flex; flex-direction: column; gap: 0.75rem; }
    .drop-area {
      width: 100%; aspect-ratio: 1; border: 2px dashed #c4b5fd; border-radius: 12px;
      display: flex; align-items: center; justify-content: center; cursor: pointer;
      background: #faf5ff; transition: all 0.2s; overflow: hidden;
      &:hover { border-color: #7c3aed; background: #f3e8ff; }
      .drop-placeholder { text-align: center; color: #9ca3af;
        mat-icon { font-size: 3rem; width: 3rem; height: 3rem; color: #c4b5fd; }
        p { margin: 0.5rem 0 0.25rem; font-weight: 500; }
        small { font-size: 0.75rem; }
      }
      .preview-img { width: 100%; height: 100%; object-fit: cover; }
    }
    .change-photo-btn { width: 100%; }
    .product-form { display: flex; flex-direction: column; gap: 0.5rem;
      mat-form-field { width: 100%; } }
    .full-width { width: 100%; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .submit-btn {
      height: 52px; font-size: 1rem; font-weight: 700;
      display: flex; align-items: center; justify-content: center; gap: 0.5rem;
      margin-top: 0.5rem;
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
  notifications: SaleNotification[] = [];
  recentOrders: Order[] = [];
  allProducts: Product[] = [];
  productForm: FormGroup;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  categories: any[] = [];
  orderColumns = ['buyer', 'total', 'status', 'items', 'date', 'actions'];
  private subs = new Subscription();

  constructor(
    private fb: FormBuilder,
    private productsService: ProductsService,
    private notificationsService: NotificationsService,
    private http: HttpClient,
    private snackBar: MatSnackBar,
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
    this.subs.add(
      this.productsService.getCategories().subscribe({ next: cats => this.categories = cats })
    );
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

  deleteProduct(id: string): void {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    this.subs.add(
      this.productsService.deleteProduct(id).subscribe({
        next: () => {
          this.snackBar.open('Producto eliminado', 'OK', { duration: 3000 });
          this.loadProducts();
        },
        error: () => this.snackBar.open('Error al eliminar', 'OK', { duration: 3000 }),
      })
    );
  }

  markAsShipped(orderId: string): void {
    const tracking = prompt('Ingresa el número de seguimiento:');
    if (!tracking) return;
    this.subs.add(
      this.http.patch(`${environment.apiUrl}/orders/${orderId}/ship`, { trackingNumber: tracking }).subscribe({
        next: () => {
          this.snackBar.open('Orden marcada como enviada', 'OK', { duration: 3000 });
          this.loadOrders();
        },
        error: () => this.snackBar.open('Error al actualizar', 'OK', { duration: 3000 }),
      })
    );
  }

  markAsDelivered(orderId: string): void {
  if (!confirm('¿Marcar esta orden como entregada?')) return;
  this.subs.add(
    this.http.patch(`${environment.apiUrl}/orders/${orderId}/deliver`, {}).subscribe({
      next: () => {
        this.snackBar.open('✅ Orden marcada como entregada', 'OK', { duration: 3000 });
        this.loadOrders();
      },
      error: () => this.snackBar.open('Error al actualizar', 'OK', { duration: 3000 }),
    })
  );
}

markAsCancelled(orderId: string): void {
  if (!confirm('¿Cancelar esta orden? Esta acción no se puede deshacer.')) return;
  this.subs.add(
    this.http.patch(`${environment.apiUrl}/orders/${orderId}/cancel`, {}).subscribe({
      next: () => {
        this.snackBar.open('Orden cancelada', 'OK', { duration: 3000 });
        this.loadOrders();
      },
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
  if (!this.selectedFile) {
    this.snackBar.open('Selecciona una imagen del producto', 'OK', { duration: 3000 }); return;
  }
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
        this.selectedFile = null;
        this.previewUrl = null;
        this.activeTab = 'products';
        this.loadProducts();
      },
      error: (err) => {
        this.isUploading = false;
        this.snackBar.open(err.error?.message || 'Error al publicar', 'Cerrar', { duration: 5000 });
      },
    })
  );
}

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', maximumFractionDigits: 0,
    }).format(price);
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      PENDING: '#f59e0b', PAID: '#10b981', SHIPPED: '#3b82f6',
      DELIVERED: '#6b7280', CANCELLED: '#ef4444',
    };
    return colors[status] || '#6b7280';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'Pendiente', PAID: 'Pagado', SHIPPED: 'Enviado',
      DELIVERED: 'Entregado', CANCELLED: 'Cancelado',
    };
    return labels[status] || status;
  }
}