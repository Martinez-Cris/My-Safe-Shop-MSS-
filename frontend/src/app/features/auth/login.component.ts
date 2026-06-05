import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatTabsModule,
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
          <mat-tab-group [(selectedIndex)]="activeTab" animationDuration="200ms">

            <!-- ── LOGIN ── -->
            <mat-tab label="Iniciar Sesión">
              <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="auth-form">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Correo electrónico</mat-label>
                  <input matInput formControlName="email" type="email" placeholder="tu@email.com">
                  <mat-icon matSuffix>email</mat-icon>
                  <mat-error>Email inválido</mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Contraseña</mat-label>
                  <input matInput formControlName="password"
                    [type]="showPassword ? 'text' : 'password'">
                  <button mat-icon-button matSuffix type="button"
                    (click)="showPassword = !showPassword">
                    <mat-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                  <mat-error>Contraseña requerida</mat-error>
                </mat-form-field>

                <button mat-raised-button type="submit"
                  class="submit-btn" [disabled]="isLoading">
                  <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
                  <mat-icon *ngIf="!isLoading">login</mat-icon>
                  {{ isLoading ? 'Ingresando...' : 'Iniciar Sesión' }}
                </button>

                <div class="admin-hint">
                  <mat-icon>admin_panel_settings</mat-icon>
                 
                </div>
              </form>
            </mat-tab>

            <!-- ── REGISTRO ── -->
            <mat-tab label="Registrarse">
              <form [formGroup]="registerForm" (ngSubmit)="onRegister()" class="auth-form">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Nombre completo</mat-label>
                  <input matInput formControlName="name" placeholder="María García">
                  <mat-icon matSuffix>person</mat-icon>
                  <mat-error>Nombre requerido (mín. 3 caracteres)</mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Correo electrónico</mat-label>
                  <input matInput formControlName="email" type="email" placeholder="tu@email.com">
                  <mat-icon matSuffix>email</mat-icon>
                  <mat-error>Email inválido</mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Contraseña</mat-label>
                  <input matInput formControlName="password"
                    [type]="showPassword ? 'text' : 'password'"
                    placeholder="Mínimo 6 caracteres">
                  <button mat-icon-button matSuffix type="button"
                    (click)="showPassword = !showPassword">
                    <mat-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                  <mat-error>Mínimo 6 caracteres</mat-error>
                </mat-form-field>

                <button mat-raised-button type="submit"
                  class="submit-btn" [disabled]="isLoading">
                  <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
                  <mat-icon *ngIf="!isLoading">person_add</mat-icon>
                  {{ isLoading ? 'Registrando...' : 'Crear Cuenta' }}
                </button>
              </form>
            </mat-tab>

          </mat-tab-group>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%);
      padding: 2rem;
      position: relative; overflow: hidden;
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
      border-radius: 20px !important; padding: 0.5rem;
      box-shadow: 0 25px 60px rgba(0,0,0,0.35) !important;
    }
    .auth-form {
      display: flex; flex-direction: column; gap: 0.5rem;
      padding: 1.5rem 1rem 1rem;
    }
    .full-width { width: 100%; }
    .submit-btn {
      height: 50px; font-size: 1rem; font-weight: 700;
      display: flex; align-items: center; justify-content: center; gap: 0.5rem;
      margin-top: 0.5rem;
      background: linear-gradient(135deg, #059669, #10b981) !important;
      color: white !important; border-radius: 10px !important;
      box-shadow: 0 4px 15px rgba(16,185,129,0.4) !important;
    }
    .admin-hint {
      display: flex; align-items: center; gap: 0.35rem;
      color: #9ca3af; font-size: 0.75rem; margin-top: 0.5rem; justify-content: center;
      mat-icon { font-size: 1rem; width: 1rem; height: 1rem; }
    }
  `]
})
export class LoginComponent {
  activeTab = 0;
  isLoading = false;
  showPassword = false;
  loginForm: FormGroup;
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/shop']);
    }
    this.loginForm = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
    this.registerForm = this.fb.group({
      name:     ['', [Validators.required, Validators.minLength(3)]],
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onLogin(): void {
    if (this.loginForm.invalid) { this.loginForm.markAllAsTouched(); return; }
    this.isLoading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.snackBar.open(`¡Bienvenido, ${res.user.name}!`, 'OK', { duration: 3000 });
        this.router.navigate([res.user.role === 'ADMIN' ? '/admin' : '/shop']);
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open(err.error?.message || 'Credenciales incorrectas', 'Cerrar', { duration: 4000 });
      },
    });
  }

  onRegister(): void {
    if (this.registerForm.invalid) { this.registerForm.markAllAsTouched(); return; }
    this.isLoading = true;
    this.authService.register(this.registerForm.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.snackBar.open(`¡Cuenta creada! Bienvenido, ${res.user.name}`, 'OK', { duration: 3000 });
        this.router.navigate(['/shop']);
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open(err.error?.message || 'Error al registrarse', 'Cerrar', { duration: 4000 });
      },
    });
  }
}