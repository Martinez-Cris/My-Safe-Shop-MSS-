import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
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

      <!-- Panel izquierdo — branding -->
      <div class="auth-branding">
        <div class="branding-content">
          <div class="brand-logo">
            <mat-icon>storefront</mat-icon>
          </div>
          <h1>MY SAFE SHOP</h1>
          <p class="brand-tagline">Renovando tu closet,<br>cuidando el planeta 🌿</p>
          <div class="brand-divider"></div>
          <p class="brand-desc">
            Encuentra ropa de segunda mano verificada a precios increíbles.
            Dale una segunda vida a las prendas y contribuye a la moda sostenible.
          </p>
          <div class="brand-features">
            <div class="feature">
              <mat-icon>verified</mat-icon>
              <span>Prendas verificadas</span>
            </div>
            <div class="feature">
              <mat-icon>lock</mat-icon>
              <span>Pagos seguros con Wompi</span>
            </div>
            <div class="feature">
              <mat-icon>local_shipping</mat-icon>
              <span>Envío a todo Bogotá</span>
            </div>
            <div class="feature">
              <mat-icon>recycling</mat-icon>
              <span>Moda circular y sostenible</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel derecho — formulario -->
      <div class="auth-form-panel">
        <div class="auth-form-wrap">
          <div class="auth-form-header">
            <mat-icon>storefront</mat-icon>
            <span>MY SAFE SHOP</span>
          </div>

          <mat-card class="auth-card">
            <mat-tab-group [(selectedIndex)]="activeTab" animationDuration="200ms">

              <!-- ── LOGIN ── -->
              <mat-tab label="Iniciar Sesión">
                <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="auth-form">
                  <h2>¡Bienvenido de vuelta!</h2>
                  <p class="form-subtitle">Ingresa tus datos para continuar</p>

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

                  <button class="submit-btn" type="submit" [disabled]="isLoading">
                    <mat-spinner *ngIf="isLoading" diameter="22"></mat-spinner>
                    <mat-icon *ngIf="!isLoading">login</mat-icon>
                    <span>{{ isLoading ? 'Ingresando...' : 'Iniciar Sesión' }}</span>
                  </button>

                  <button mat-button type="button" class="forgot-btn" (click)="goToForgot()">
                    ¿Olvidaste tu contraseña?
                  </button>
                </form>
              </mat-tab>

              <!-- ── REGISTRO ── -->
              <mat-tab label="Crear Cuenta">
                <form [formGroup]="registerForm" (ngSubmit)="onRegister()" class="auth-form">
                  <h2>Únete a la comunidad</h2>
                  <p class="form-subtitle">Crea tu cuenta y empieza a comprar</p>

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

                  <button class="submit-btn register" type="submit" [disabled]="isLoading">
                    <mat-spinner *ngIf="isLoading" diameter="22"></mat-spinner>
                    <mat-icon *ngIf="!isLoading">person_add</mat-icon>
                    <span>{{ isLoading ? 'Registrando...' : 'Crear Cuenta Gratis' }}</span>
                  </button>

                  <p class="terms-note">
                    Al registrarte aceptas nuestros términos y política de privacidad.
                  </p>
                </form>
              </mat-tab>

            </mat-tab-group>
          </mat-card>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: grid;
      grid-template-columns: 1fr 1fr;
      @media (max-width: 768px) { grid-template-columns: 1fr; }
    }

    /* Panel izquierdo */
    .auth-branding {
      background: linear-gradient(145deg, #022c22 0%, #064e3b 40%, #065f46 70%, #047857 100%);
      display: flex; align-items: center; justify-content: center;
      padding: 3rem 2.5rem; position: relative; overflow: hidden;
      @media (max-width: 768px) { display: none; }
    }
    .auth-branding::before {
      content: ''; position: absolute;
      width: 500px; height: 500px;
      background: rgba(255,255,255,0.03); border-radius: 50%;
      top: -150px; right: -150px;
    }
    .auth-branding::after {
      content: ''; position: absolute;
      width: 350px; height: 350px;
      background: rgba(255,255,255,0.03); border-radius: 50%;
      bottom: -100px; left: -100px;
    }
    .branding-content { position: relative; z-index: 1; color: white; max-width: 400px; }
    .brand-logo {
      width: 80px; height: 80px;
      background: rgba(255,255,255,0.12); border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 1.5rem;
      border: 2px solid rgba(255,255,255,0.2);
      backdrop-filter: blur(8px);
      mat-icon { font-size: 2.5rem; width: 2.5rem; height: 2.5rem; color: #6ee7b7; }
    }
    .branding-content h1 {
      font-size: 2.5rem; font-weight: 900; margin: 0 0 0.5rem;
      letter-spacing: 0.05em; color: white;
    }
    .brand-tagline {
      font-size: 1.25rem; color: #6ee7b7; margin: 0 0 1.5rem;
      font-weight: 600; line-height: 1.4;
    }
    .brand-divider {
      width: 60px; height: 3px;
      background: linear-gradient(90deg, #10b981, #6ee7b7);
      border-radius: 99px; margin-bottom: 1.5rem;
    }
    .brand-desc {
      color: rgba(255,255,255,0.7); font-size: 0.95rem;
      line-height: 1.7; margin-bottom: 2rem;
    }
    .brand-features { display: flex; flex-direction: column; gap: 0.85rem; }
    .feature {
      display: flex; align-items: center; gap: 0.75rem;
      color: rgba(255,255,255,0.85); font-size: 0.9rem;
      mat-icon { color: #34d399; font-size: 1.2rem; width: 1.2rem; height: 1.2rem; flex-shrink: 0; }
    }

    /* Panel derecho */
    .auth-form-panel {
      background: #f9fafb;
      display: flex; align-items: center; justify-content: center;
      padding: 2rem 1.5rem;
    }
    .auth-form-wrap { width: 100%; max-width: 420px; }
    .auth-form-header {
      display: flex; align-items: center; gap: 0.5rem;
      color: #064e3b; font-weight: 800; font-size: 1.1rem;
      margin-bottom: 1.5rem; justify-content: center;
      @media (min-width: 769px) { display: none; }
      mat-icon { color: #059669; }
    }
    .auth-card {
      border-radius: 20px !important; padding: 0.25rem;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1) !important;
    }
    .auth-form {
      display: flex; flex-direction: column; gap: 0.5rem;
      padding: 1.5rem 1.25rem 1.25rem;
      h2 { margin: 0 0 0.25rem; font-size: 1.35rem; font-weight: 800; color: #064e3b; }
      .form-subtitle { color: #6b7280; font-size: 0.875rem; margin: 0 0 1rem; }
    }
    .full-width { width: 100%; }

    /* Botón submit */
    .submit-btn {
      width: 100%; height: 54px; border: none; border-radius: 12px;
      cursor: pointer; margin-top: 0.5rem;
      background: linear-gradient(135deg, #059669, #10b981);
      color: white; font-size: 1rem; font-weight: 700;
      display: flex; align-items: center; justify-content: center; gap: 0.6rem;
      box-shadow: 0 6px 20px rgba(5,150,105,0.4);
      transition: transform 0.2s, box-shadow 0.2s;
      mat-icon { font-size: 1.2rem; }
      &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(5,150,105,0.5); }
      &:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }
      &.register { background: linear-gradient(135deg, #047857, #059669); }
    }
    .forgot-btn { color: #6b7280; font-size: 0.85rem; margin-top: 0.25rem; text-align: center; width: 100%; }
    .terms-note { font-size: 0.75rem; color: #9ca3af; text-align: center; margin: 0.5rem 0 0; }
  `]
})
export class LoginComponent implements OnInit {
  activeTab = 0;
  isLoading = false;
  showPassword = false;
  loginForm: FormGroup;
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
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

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['reason'] === 'inactivity') {
        this.snackBar.open(
          '⏱️ Tu sesión expiró por inactividad. Por favor inicia sesión nuevamente.',
          'OK',
          { duration: 6000 }
        );
      }
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

  goToForgot(): void { this.router.navigate(['/forgot-password']); }
}