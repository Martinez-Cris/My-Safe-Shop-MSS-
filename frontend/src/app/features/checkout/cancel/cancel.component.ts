 import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-checkout-cancel',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="cancel-page">
      <div class="cancel-card">
        <mat-icon class="cancel-icon">cancel</mat-icon>
        <h1>Pago Cancelado</h1>
        <p>No se realizó ningún cargo. Puedes intentarlo de nuevo.</p>
        <div class="actions">
          <button mat-raised-button routerLink="/cart">
            <mat-icon>arrow_back</mat-icon> Volver al carrito
          </button>
          <button mat-stroked-button routerLink="/shop">Ver productos</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cancel-page { min-height: calc(100vh - 64px); display: flex; align-items: center; justify-content: center; background: #fff5f5; padding: 2rem; }
    .cancel-card { background: white; border-radius: 20px; padding: 3rem; text-align: center; max-width: 420px; box-shadow: 0 10px 40px rgba(239,68,68,0.1); }
    .cancel-icon { font-size: 5rem; width: 5rem; height: 5rem; color: #ef4444; }
    h1 { color: #7f1d1d; }
    p { color: #6b7280; margin-bottom: 2rem; }
    .actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
  `]
})
export class CheckoutCancelComponent {}
