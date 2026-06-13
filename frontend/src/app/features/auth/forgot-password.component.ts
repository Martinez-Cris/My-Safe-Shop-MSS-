import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
  selector: 'app-forgot-password',
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

            <!-- Estado: formulario -->
            <div *ngIf="!emailSent">
              <div class="card-header">
                <mat-icon class="header-icon">lock_reset</mat-icon>
                <h2>Recuperar contraseña</h2>
                <p>Ingresa tu correo y te enviaremos un enlace para restablecerla</p>
              </div>

              <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Correo electrónico</mat-label>
                  <input matInput formControlName="email" type="email" placeholder="tu@email.com">
                  <mat-icon matSuffix>email</mat-icon>
                  <mat-error>Ingresa un email válido</mat-error>
                </mat-form-field>

                <button mat-raised-button type="submit"
                  class="submit-btn" [disabled]="isLoading">
                  <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
                  <mat-icon *ngIf="!isLoading">send</mat-icon>
                  {{ isLoading ? 'Enviando...' : 'Enviar enlace' }}
                </button>

                <button mat-button type="button" class="back-btn" (click)="goToLogin()">
                  <mat-icon>arrow_back</mat-icon> Volver al inicio de sesión
                </button>
              </form>
            </div>

            <!-- Estado: correo enviado -->
            <div *ngIf="emailSent" class="success-state">
              <div class="success-icon">
                <mat-icon>mark_email_read</mat-icon>
              </div>
              <h2>¡Correo enviado!</h2>
              <p>Si el correo está registrado, recibirás un enlace en los próximos minutos.</p>
              <p class="hint">Revisa también tu carpeta de spam.</p>
              <button mat-raised-button class="submit-btn" (click)="goToLogin()">
                <mat-icon>login</mat-icon> Volver al inicio de sesión
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
    .back-btn {
      color: #6b7280; display: flex; align-items: center;
      justify-content: center; gap: 0.25rem; font-size: 0.9rem;
    }
    .success-state { text-align: center; padding: 1rem 0;
      .success-icon {
        width: 80px; height: 80px; border-radius: 50%;
        background: #d1fae5; display: flex; align-items: center;
        justify-content: center; margin: 0 auto 1.5rem;
        mat-icon { font-size: 2.5rem; width: 2.5rem; height: 2.5rem; color: #059669; }
      }
      h2 { font-size: 1.4rem; font-weight: 700; color: #064e3b; margin: 0 0 0.75rem; }
      p { color: #6b7280; margin: 0 0 0.5rem; }
      .hint { font-size: 0.85rem; color: #9ca3af; margin-bottom: 1.5rem; }
    }
  `]
})
export class ForgotPasswordComponent {
  form: FormGroup;
  isLoading = false;
  emailSent = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isLoading = true;
    this.http.post(`${environment.apiUrl}/auth/forgot-password`, this.form.value).subscribe({
      next: () => { this.isLoading = false; this.emailSent = true; },
      error: () => { this.isLoading = false; this.emailSent = true; }, // igual para no revelar si existe
    });
  }

  goToLogin(): void { this.router.navigate(['/login']); }
}