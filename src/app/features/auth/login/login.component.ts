import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="login-page">
      <!-- Left panel -->
      <div class="login-left">
        <div class="left-content">
          <div class="logo-box">
            <mat-icon>hub</mat-icon>
          </div>
          <h1 class="brand-title">Clientes<span>SaaS</span></h1>
          <p class="brand-desc">Plataforma integral para gestionar clientes, dominios y servicios web.</p>

          <div class="feature-list">
            <div class="feature-item">
              <div class="feature-icon purple"><mat-icon>shield</mat-icon></div>
              <div class="feature-text">
                <strong>Control por Roles</strong>
                <span>Admin, Editor y Viewer con permisos diferenciados</span>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon amber"><mat-icon>notifications_active</mat-icon></div>
              <div class="feature-text">
                <strong>Alertas Automaticas</strong>
                <span>Notificaciones a 30, 15 y 7 dias del vencimiento</span>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon cyan"><mat-icon>travel_explore</mat-icon></div>
              <div class="feature-text">
                <strong>WHOIS Integrado</strong>
                <span>Consulta informacion de dominios en tiempo real</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Decorative circles -->
        <div class="deco deco-1"></div>
        <div class="deco deco-2"></div>
        <div class="deco deco-3"></div>
      </div>

      <!-- Right panel -->
      <div class="login-right">
        <div class="form-wrapper">
          <div class="form-header">
            <div class="mobile-logo">
              <mat-icon>hub</mat-icon>
            </div>
            <h2>Bienvenido de nuevo</h2>
            <p>Ingresa tus credenciales para acceder al panel</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="login-form">
            <div class="field-group">
              <label class="field-label">Email</label>
              <mat-form-field class="custom-field" appearance="outline">
                <mat-icon matPrefix>mail_outline</mat-icon>
                <input matInput formControlName="email" type="email"
                       placeholder="tucorreo&#64;empresa.com" />
                @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
                  <mat-error>Ingresa un email valido</mat-error>
                }
              </mat-form-field>
            </div>

            <div class="field-group">
              <label class="field-label">Contrasena</label>
              <mat-form-field class="custom-field" appearance="outline">
                <mat-icon matPrefix>lock_outline</mat-icon>
                <input matInput formControlName="password"
                       [type]="hidePassword ? 'password' : 'text'"
                       placeholder="Ingresa tu contrasena" />
                <button mat-icon-button matSuffix type="button"
                        (click)="hidePassword = !hidePassword" tabindex="-1">
                  <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                @if (form.get('password')?.hasError('minlength') && form.get('password')?.touched) {
                  <mat-error>Minimo 6 caracteres</mat-error>
                }
              </mat-form-field>
            </div>

            <button type="submit" class="submit-btn" [disabled]="form.invalid || loading()">
              @if (loading()) {
                <mat-spinner diameter="20"></mat-spinner>
                <span>Ingresando...</span>
              } @else {
                <span>Ingresar</span>
                <mat-icon>arrow_forward</mat-icon>
              }
            </button>
          </form>

          <div class="form-footer">
            <span>Clientes SaaS v1.0</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      display: flex;
      min-height: 100vh;
      background: #f8fafc;
    }

    /* ========== LEFT PANEL ========== */
    .login-left {
      flex: 0 0 50%;
      background: linear-gradient(160deg, #0c0a1d 0%, #1a1145 40%, #2d1b69 70%, #1e1b4b 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 60px;
      position: relative;
      overflow: hidden;
    }
    .left-content {
      position: relative;
      z-index: 2;
      max-width: 440px;
    }
    .logo-box {
      width: 60px; height: 60px;
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
      border-radius: 16px;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 8px 32px rgba(124, 58, 237, 0.35);
      margin-bottom: 28px;

      mat-icon { font-size: 30px; width: 30px; height: 30px; color: white; }
    }
    .brand-title {
      font-size: 42px;
      font-weight: 800;
      color: #ffffff;
      margin: 0 0 12px;
      letter-spacing: -0.5px;

      span { color: #a78bfa; }
    }
    .brand-desc {
      font-size: 17px;
      color: #a5b4c8;
      line-height: 1.7;
      margin: 0 0 48px;
    }

    /* Features */
    .feature-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .feature-item {
      display: flex;
      align-items: flex-start;
      gap: 14px;
    }
    .feature-icon {
      width: 40px; height: 40px; min-width: 40px;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;

      mat-icon { font-size: 20px; width: 20px; height: 20px; color: white; }
    }
    .feature-icon.purple { background: rgba(139, 92, 246, 0.2); mat-icon { color: #a78bfa; } }
    .feature-icon.amber { background: rgba(245, 158, 11, 0.15); mat-icon { color: #fbbf24; } }
    .feature-icon.cyan { background: rgba(6, 182, 212, 0.15); mat-icon { color: #22d3ee; } }
    .feature-text {
      display: flex; flex-direction: column; gap: 2px;
      strong { font-size: 14px; color: #e2e8f0; font-weight: 600; }
      span { font-size: 13px; color: #64748b; line-height: 1.4; }
    }

    /* Decorative elements */
    .deco {
      position: absolute;
      border-radius: 50%;
      z-index: 1;
    }
    .deco-1 {
      width: 500px; height: 500px;
      top: -200px; right: -150px;
      background: radial-gradient(circle, rgba(124, 58, 237, 0.12) 0%, transparent 65%);
    }
    .deco-2 {
      width: 350px; height: 350px;
      bottom: -120px; left: -80px;
      background: radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, transparent 65%);
    }
    .deco-3 {
      width: 200px; height: 200px;
      bottom: 15%; right: 10%;
      background: radial-gradient(circle, rgba(139, 92, 246, 0.06) 0%, transparent 65%);
    }

    /* ========== RIGHT PANEL ========== */
    .login-right {
      flex: 0 0 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      background: #ffffff;
    }
    .form-wrapper {
      width: 100%;
      max-width: 420px;
      display: flex;
      flex-direction: column;
    }
    .form-header {
      margin-bottom: 36px;

      h2 {
        font-size: 30px;
        font-weight: 800;
        color: #0f172a;
        margin: 0 0 8px;
        letter-spacing: -0.3px;
      }
      p {
        font-size: 15px;
        color: #94a3b8;
        margin: 0;
      }
    }
    .mobile-logo {
      display: none;
      width: 48px; height: 48px;
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
      border-radius: 14px;
      align-items: center; justify-content: center;
      margin-bottom: 24px;
      mat-icon { font-size: 24px; width: 24px; height: 24px; color: white; }
    }

    /* Form */
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .field-group {
      display: flex;
      flex-direction: column;
    }
    .field-label {
      font-size: 13px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 6px;
      letter-spacing: 0.01em;
    }
    .custom-field {
      width: 100%;
    }

    /* Submit Button */
    .submit-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      height: 52px;
      margin-top: 12px;
      border: none;
      border-radius: 12px;
      background: linear-gradient(135deg, #7c3aed, #6d28d9);
      color: white;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 4px 16px rgba(124, 58, 237, 0.3);
      letter-spacing: 0.02em;

      mat-icon { font-size: 20px; width: 20px; height: 20px; transition: transform 0.2s; }

      &:hover:not(:disabled) {
        background: linear-gradient(135deg, #6d28d9, #5b21b6);
        box-shadow: 0 6px 24px rgba(124, 58, 237, 0.4);
        transform: translateY(-1px);

        mat-icon { transform: translateX(4px); }
      }

      &:active:not(:disabled) {
        transform: translateY(0);
        box-shadow: 0 2px 8px rgba(124, 58, 237, 0.3);
      }

      &:disabled {
        background: #e2e8f0;
        color: #94a3b8;
        box-shadow: none;
        cursor: not-allowed;
      }
    }

    .form-footer {
      margin-top: 48px;
      text-align: center;
      span { font-size: 12px; color: #cbd5e1; }
    }

    /* ========== RESPONSIVE ========== */
    @media (max-width: 900px) {
      .login-left { display: none; }
      .login-right {
        flex: 1;
        background: linear-gradient(180deg, #f8fafc 0%, #ffffff 30%);
        padding: 32px 24px;
      }
      .mobile-logo { display: flex; }
      .form-wrapper { max-width: 380px; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  form: FormGroup;
  hidePassword = true;
  loading = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    const { email, password } = this.form.value;

    this.authService.login(email, password).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.snackBar.open(
          err.error?.message || 'Credenciales invalidas',
          'Cerrar',
          { duration: 3000 },
        );
      },
    });
  }
}
