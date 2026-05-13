import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule,
    MatSnackBarModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="profile-page">
      <div class="profile-container">

        <div class="profile-header">
          <div class="avatar">
            <mat-icon>person</mat-icon>
          </div>
          <div class="header-info">
            <h1>Mi Perfil</h1>
            <p>Gestiona tu información personal</p>
          </div>
        </div>

        <mat-card class="profile-card">
          <mat-card-content>
            <h2 class="section-title">
              <mat-icon>edit</mat-icon> Información Personal
            </h2>

            <form [formGroup]="profileForm" (ngSubmit)="onSave()" class="profile-form">

              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Nombre completo</mat-label>
                  <input matInput formControlName="name" placeholder="María García">
                  <mat-icon matSuffix>person</mat-icon>
                  <mat-error>Nombre requerido (mín. 3 caracteres)</mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Correo electrónico</mat-label>
                  <input matInput formControlName="email" type="email">
                  <mat-icon matSuffix>email</mat-icon>
                  <mat-error>Email inválido</mat-error>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Número de contacto</mat-label>
                  <input matInput formControlName="phone" placeholder="+57 300 000 0000">
                  <mat-icon matSuffix>phone</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Ciudad</mat-label>
                  <input matInput formControlName="city" placeholder="Bogotá">
                  <mat-icon matSuffix>location_city</mat-icon>
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Dirección de entrega</mat-label>
                <input matInput formControlName="address"
                  placeholder="Calle 123 # 45-67, Barrio, Ciudad">
                <mat-icon matSuffix>home</mat-icon>
              </mat-form-field>

              <div class="form-actions">
                <button mat-raised-button type="submit"
                  class="save-btn" [disabled]="isSaving || profileForm.invalid">
                  <mat-spinner *ngIf="isSaving" diameter="20"></mat-spinner>
                  <mat-icon *ngIf="!isSaving">save</mat-icon>
                  {{ isSaving ? 'Guardando...' : 'Guardar Cambios' }}
                </button>
              </div>

            </form>
          </mat-card-content>
        </mat-card>

        <mat-card class="profile-card">
          <mat-card-content>
            <h2 class="section-title">
              <mat-icon>lock</mat-icon> Cambiar Contraseña
            </h2>
            <form [formGroup]="passwordForm" (ngSubmit)="onChangePassword()" class="profile-form">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Contraseña actual</mat-label>
                <input matInput formControlName="currentPassword"
                  [type]="showCurrent ? 'text' : 'password'">
                <button mat-icon-button matSuffix type="button"
                  (click)="showCurrent = !showCurrent">
                  <mat-icon>{{ showCurrent ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </mat-form-field>

              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Nueva contraseña</mat-label>
                  <input matInput formControlName="newPassword"
                    [type]="showNew ? 'text' : 'password'"
                    placeholder="Mínimo 6 caracteres">
                  <button mat-icon-button matSuffix type="button"
                    (click)="showNew = !showNew">
                    <mat-icon>{{ showNew ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                  <mat-error>Mínimo 6 caracteres</mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Confirmar contraseña</mat-label>
                  <input matInput formControlName="confirmPassword"
                    [type]="showConfirm ? 'text' : 'password'">
                  <button mat-icon-button matSuffix type="button"
                    (click)="showConfirm = !showConfirm">
                    <mat-icon>{{ showConfirm ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                </mat-form-field>
              </div>

              <div class="form-actions">
                <button mat-raised-button type="submit"
                  class="save-btn" [disabled]="isSavingPassword || passwordForm.invalid">
                  <mat-spinner *ngIf="isSavingPassword" diameter="20"></mat-spinner>
                  <mat-icon *ngIf="!isSavingPassword">lock_reset</mat-icon>
                  {{ isSavingPassword ? 'Actualizando...' : 'Cambiar Contraseña' }}
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>

      </div>
    </div>
  `,
  styles: [`
    .profile-page {
      min-height: 100vh;
      background: #f0fdf4;
      padding: 2rem 1rem;
    }
    .profile-container {
      max-width: 800px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .profile-header {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      background: linear-gradient(135deg, #064e3b, #059669);
      border-radius: 20px;
      padding: 2rem;
      color: white;
    }
    .avatar {
      width: 80px; height: 80px;
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      border: 3px solid rgba(255,255,255,0.4);
      flex-shrink: 0;
      mat-icon { font-size: 2.5rem; width: 2.5rem; height: 2.5rem; color: #6ee7b7; }
    }
    .header-info h1 { margin: 0 0 0.25rem; font-size: 1.75rem; font-weight: 800; }
    .header-info p { margin: 0; color: rgba(255,255,255,0.7); }
    .profile-card {
      border-radius: 16px !important;
      box-shadow: 0 2px 12px rgba(6,78,59,0.08) !important;
    }
    .section-title {
      display: flex; align-items: center; gap: 0.5rem;
      color: #064e3b; font-size: 1.1rem; font-weight: 700;
      margin: 0 0 1.5rem;
      mat-icon { color: #059669; }
    }
    .profile-form {
      display: flex; flex-direction: column; gap: 0.75rem;
    }
    .form-row {
      display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
    }
    .full-width { width: 100%; }
    mat-form-field { width: 100%; }
    .form-actions { display: flex; justify-content: flex-end; margin-top: 0.5rem; }
    .save-btn {
      height: 48px;
      padding: 0 2rem;
      font-size: 0.95rem;
      font-weight: 700;
      display: flex; align-items: center; gap: 0.5rem;
      background: linear-gradient(135deg, #059669, #10b981) !important;
      color: white !important;
      border-radius: 10px !important;
      box-shadow: 0 4px 12px rgba(16,185,129,0.3) !important;
    }
    @media (max-width: 600px) {
      .form-row { grid-template-columns: 1fr; }
      .profile-header { flex-direction: column; text-align: center; }
    }
  `]
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  isSaving = false;
  isSavingPassword = false;
  showCurrent = false;
  showNew = false;
  showConfirm = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private http: HttpClient,
    private snackBar: MatSnackBar,
  ) {
    this.profileForm = this.fb.group({
      name:    ['', [Validators.required, Validators.minLength(3)]],
      email:   ['', [Validators.required, Validators.email]],
      phone:   [''],
      address: [''],
      city:    [''],
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword:     ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    });
  }

 ngOnInit(): void {
  const user = this.authService.getUser();
  if (user) {
    this.profileForm.patchValue({
      name:    user.name  || '',
      email:   user.email || '',
      phone:   '',
      address: '',
      city:    '',
    });
  }
}
  onSave(): void {
    if (this.profileForm.invalid) { this.profileForm.markAllAsTouched(); return; }
    this.isSaving = true;
    this.http.patch(`${environment.apiUrl}/auth/profile`, this.profileForm.value).subscribe({
      next: () => {
        this.isSaving = false;
        this.snackBar.open('✅ Perfil actualizado correctamente', 'OK', { duration: 3000 });
      },
      error: (err) => {
        this.isSaving = false;
        this.snackBar.open(err.error?.message || 'Error al guardar', 'Cerrar', { duration: 4000 });
      },
    });
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) { this.passwordForm.markAllAsTouched(); return; }
    const { newPassword, confirmPassword, currentPassword } = this.passwordForm.value;
    if (newPassword !== confirmPassword) {
      this.snackBar.open('Las contraseñas no coinciden', 'Cerrar', { duration: 3000 });
      return;
    }
    this.isSavingPassword = true;
    this.http.patch(`${environment.apiUrl}/auth/change-password`, { currentPassword, newPassword }).subscribe({
      next: () => {
        this.isSavingPassword = false;
        this.snackBar.open('✅ Contraseña actualizada', 'OK', { duration: 3000 });
        this.passwordForm.reset();
      },
      error: (err) => {
        this.isSavingPassword = false;
        this.snackBar.open(err.error?.message || 'Error al cambiar contraseña', 'Cerrar', { duration: 4000 });
      },
    });
  }
}