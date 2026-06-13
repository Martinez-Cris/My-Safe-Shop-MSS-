import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule,
    MatProgressSpinnerModule, MatSnackBarModule,
  ],
  template: `
    <div class="auth-page">
      <div class="auth-container">

        <div class="auth-brand">
          <div class="brand-icon-wrap">
            <mat-icon>storefront</mat-icon>
          </div>
          <h1>MY SAFE SHOP</h1>
          <p>Ropa de segunda mano verificada</p>
        </div>

        <mat-card class="auth-card">
          <div class="card-content">

            <!-- Token inválido -->
            <div *ngIf="!token" class="error-state">
              <mat-icon class="error-icon">error_outline</mat-icon>
              <h2>Enlace inválido</h2>
              <p>Este enlace no es válido o ha expirado.</p>
              <button mat-raised-button class="submit-btn" (click)="goToForgot()">
                <mat-icon>lock_reset</mat-icon> Solicitar nuevo enlace
              </button>
            </div>

            <!-- Formulario -->
            <div *ngIf="token && !resetDone">
              <div class="card-header">
                <mat-icon class="header-icon">lock_open</mat-icon>
                <h2>Nueva contraseña</h2>
                <p>Ingresa tu nueva contraseña para acceder a tu cuenta</p>
              </div>

              <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Nueva contraseña</mat-label>
                  <input matInput formControlName="newPassword"
                    [type]="showPassword ? 'text' : 'password'"
                    placeholder="Mínimo 6 caracteres">
                  <button mat-icon-button matSuffix type="button"
                    (click)="showPassword = !showPassword">
                    <mat-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                  <mat-error>Mínimo 6 caracteres</mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Confirmar contraseña</mat-label>
                  <input matInput formControlName="confirmPassword"
                    [type]="showPassword ? 'text' : 'password'">
                  <mat-error>Las contraseñas no coinciden</mat-error>
                </mat-form-field>

                <button mat-raised-button type="submit"
                  class="submit-btn" [disabled]="isLoading">
                  <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
                  <mat-icon *ngIf="!isLoading">save</mat-icon>
                  {{ isLoading ? 'Guardando...' : 'Guardar contraseña' }}
                </button>
              </form>
            </div>

            <!-- Éxito -->
            <div *ngIf="resetDone" class="success-state">
              <div class="success-icon">
                <mat-icon>check_circle</mat-icon>
              </div>
              <h2>¡Contraseña actualizada!</h2>
              <p>Ya puedes iniciar sesión con tu nueva contraseña.</p>
              <button mat-raised-button class="submit-btn" (click)="goToLogin()">
                <mat-icon>login</mat-icon> Ir al inicio de sesión
              </button>
            </div>

          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%);
      padding: 2rem; position: relative; overflow: hidden;
    }
    .auth-page::before {
      content: ''; position: absolute;
      width: 400px; height: 400px;
      background: rgba(255,255,255,0.04); border-radius: 50%;
      top: -100px; right: -100px;
    }
    .auth-page::after {
      content: ''; position: absolute;
      width: 300px; height: 300px;
      background: rgba(255,255,255,0.04); border-radius: 50%;
      bottom: -80px; left: -80px;
    }
    .auth-container { width: 100%; max-width: 440px; position: relative; z-index: 1; }
    .auth-brand { text-align: center; color: white; margin-bottom: 2rem; }
    .brand-icon-wrap {
      display: inline-flex; align-items: center; justify-content: center;
      width: 72px; height: 72px;
      background: rgba(255,255,255,0.15); border-radius: 50%; margin-bottom: 1rem;
      backdrop-filter: blur(8px); border: 2px solid rgba(255,255,255,0.25);
      mat-icon { font-size: 2.2rem; width: 2.2rem; height: 2.2rem; color: #6ee7b7; }
    }
    .auth-brand h1 { font-size: 1.85rem; font-weight: 800; margin: 0 0 0.35rem; letter-spacing: 0.05em; }
    .auth-brand p { color: rgba(255,255,255,0.65); margin: 0; font-size: 0.9rem; }
    .auth-card {
      border-radius: 20px !important;
      box-shadow: 0 25px 60px rgba(0,0,0,0.35) !important;
    }
    .card-content { padding: 2rem; }
    .card-header { text-align: center; margin-bottom: 1.5rem;
      .header-icon { font-size: 3rem; width: 3rem; height: 3rem; color: #059669; }
      h2 { font-size: 1.4rem; font-weight: 700; color: #064e3b; margin: 0.5rem 0 0.25rem; }
      p { color: #6b7280; font-size: 0.9rem; margin: 0; }
    }
    .auth-form { display: flex; flex-direction: column; gap: 0.75rem; }
    .full-width { width: 100%; }
    .submit-btn {
      height: 50px; font-size: 1rem; font-weight: 700;
      display: flex; align-items: center; justify-content: center; gap: 0.5rem;
      background: linear-gradient(135deg, #059669, #10b981) !important;
      color: white !important; border-radius: 10px !important;
      box-shadow: 0 4px 15px rgba(16,185,129,0.4) !important;
    }
    .success-state, .error-state { text-align: center; padding: 1rem 0;
      .success-icon, .error-icon {
        width: 80px; height: 80px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;
        mat-icon { font-size: 2.5rem; width: 2.5rem; height: 2.5rem; }
      }
      .success-icon { background: #d1fae5; mat-icon { color: #059669; } }
      .error-icon { font-size: 3rem; width: 3rem; height: 3rem; color: #ef4444; margin: 0 auto 1rem; display: block; }
      h2 { font-size: 1.4rem; font-weight: 700; color: #064e3b; margin: 0 0 0.75rem; }
      p { color: #6b7280; margin: 0 0 1.5rem; }
    }
  `]
})
export class ResetPasswordComponent implements OnInit {
  form: FormGroup;
  isLoading = false;
  showPassword = false;
  resetDone = false;
  token: string | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
  ) {
    this.form = this.fb.group({
      newPassword:     ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    }, { validators: this.passwordsMatch });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
  }

  passwordsMatch(group: AbstractControl) {
    const pass = group.get('newPassword')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass === confirm ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.form.invalid || !this.token) {
      this.form.markAllAsTouched();
      if (this.form.hasError('mismatch')) {
        this.snackBar.open('Las contraseñas no coinciden', 'OK', { duration: 3000 });
      }
      return;
    }
    this.isLoading = true;
    this.http.post(`${environment.apiUrl}/auth/reset-password`, {
      token: this.token,
      newPassword: this.form.value.newPassword,
    }).subscribe({
      next: () => { this.isLoading = false; this.resetDone = true; },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open(err.error?.message || 'El enlace es inválido o ha expirado', 'Cerrar', { duration: 4000 });
      },
    });
  }

  goToLogin(): void { this.router.navigate(['/login']); }
  goToForgot(): void { this.router.navigate(['/forgot-password']); }
}