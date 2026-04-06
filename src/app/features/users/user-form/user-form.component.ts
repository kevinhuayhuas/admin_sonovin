import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';
import { UserService } from '../../../core/services/user.service';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatSlideToggleModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule, SkeletonComponent,
  ],
  template: `
    <div class="page-header">
      <div>
        <h1>{{ isEdit ? 'Editar' : 'Nuevo' }} Usuario</h1>
        <p class="text-slate-500">{{ isEdit ? 'Modifica los datos del usuario' : 'Registra un nuevo usuario del sistema' }}</p>
      </div>
    </div>

    @if (loadingData) {
      <mat-card class="form-card"><mat-card-content class="p-6"><app-skeleton type="form"></app-skeleton></mat-card-content></mat-card>
    } @else {
      <mat-card class="form-card">
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-body">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Nombre completo</mat-label>
              <mat-icon matPrefix>person</mat-icon>
              <input matInput formControlName="nombre" placeholder="Nombre del usuario" />
              @if (form.get('nombre')?.hasError('required') && form.get('nombre')?.touched) {
                <mat-error>El nombre es obligatorio</mat-error>
              }
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Email</mat-label>
              <mat-icon matPrefix>email</mat-icon>
              <input matInput formControlName="email" type="email" placeholder="correo&#64;empresa.com" />
              @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
                <mat-error>Ingresa un email valido</mat-error>
              }
            </mat-form-field>
            @if (!isEdit) {
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Contrasena</mat-label>
                <mat-icon matPrefix>lock</mat-icon>
                <input matInput formControlName="password" type="password" placeholder="Minimo 6 caracteres" />
                @if (form.get('password')?.hasError('minlength') && form.get('password')?.touched) {
                  <mat-error>Minimo 6 caracteres</mat-error>
                }
              </mat-form-field>
            }
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Rol</mat-label>
              <mat-icon matPrefix>shield</mat-icon>
              <mat-select formControlName="role">
                <mat-option value="ADMIN">Admin - Acceso total</mat-option>
                <mat-option value="EDITOR">Editor - Crear y editar</mat-option>
                <mat-option value="VIEWER">Viewer - Solo lectura</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-slide-toggle formControlName="activo">Usuario activo</mat-slide-toggle>

            <div class="form-actions">
              <button type="submit" class="submit-btn" [disabled]="form.invalid || saving">
                @if (saving) {
                  <mat-spinner diameter="18"></mat-spinner>
                  <span>{{ isEdit ? 'Guardando...' : 'Creando...' }}</span>
                } @else {
                  <mat-icon>{{ isEdit ? 'save' : 'person_add' }}</mat-icon>
                  <span>{{ isEdit ? 'Guardar cambios' : 'Crear usuario' }}</span>
                }
              </button>
              <button type="button" class="cancel-btn" (click)="router.navigate(['/users'])" [disabled]="saving">Cancelar</button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    }
  `,
  styles: [`
    .page-header { margin-bottom: 24px; h1 { font-size: 26px; font-weight: 700; color: #0f172a; margin: 0; } }
    .form-card { max-width: 520px; padding: 0 !important; overflow: hidden; }
    .form-body { display: flex; flex-direction: column; gap: 4px; padding: 24px; }
    .form-actions { display: flex; gap: 12px; margin-top: 12px; padding-top: 16px; border-top: 1px solid #f1f5f9; }
    .submit-btn {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      height: 44px; padding: 0 24px; background: linear-gradient(135deg, #7c3aed, #6d28d9);
      color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 600;
      cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(124,58,237,0.25);
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
      &:hover:not(:disabled) { box-shadow: 0 4px 16px rgba(124,58,237,0.35); transform: translateY(-1px); }
      &:disabled { background: #e2e8f0; color: #94a3b8; box-shadow: none; cursor: not-allowed; }
    }
    .cancel-btn {
      height: 44px; padding: 0 20px; background: transparent; border: 1px solid #e2e8f0;
      border-radius: 10px; color: #64748b; font-size: 14px; cursor: pointer; transition: all 0.15s;
      &:hover { background: #f8fafc; }
    }
  `],
})
export class UserFormComponent implements OnInit {
  form: FormGroup;
  isEdit = false;
  userId?: number;
  saving = false;
  loadingData = false;

  constructor(
    private fb: FormBuilder, private userService: UserService,
    private route: ActivatedRoute, public router: Router,
    private snackBar: MatSnackBar, private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['VIEWER', Validators.required],
      activo: [true],
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id && id !== 'new') {
      this.isEdit = true;
      this.userId = +id;
      this.loadingData = true;
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.updateValueAndValidity();
      this.userService.getById(this.userId)
        .pipe(finalize(() => { this.loadingData = false; this.cdr.detectChanges(); }))
        .subscribe({
          next: (r: any) => this.form.patchValue(r.data || r),
          error: () => {
            this.snackBar.open('No se pudo cargar el usuario.', 'Cerrar', { duration: 4000 });
            this.router.navigate(['/users']);
          },
        });
    }
  }

  onSubmit(): void {
    if (this.form.invalid || this.saving) return;
    this.saving = true;
    const val = { ...this.form.value };
    const name = val.nombre;
    if (this.isEdit && !val.password) delete val.password;

    const action = this.isEdit ? this.userService.update(this.userId!, val) : this.userService.create(val);
    action.pipe(finalize(() => { this.saving = false; this.cdr.detectChanges(); })).subscribe({
      next: () => {
        this.snackBar.open(
          this.isEdit
            ? `"${name}" actualizado correctamente`
            : `Usuario "${name}" creado exitosamente`,
          'OK', { duration: 3000 },
        );
        this.router.navigate(['/users']);
      },
      error: (err) => {
        const msg = Array.isArray(err.error?.message)
          ? err.error.message.join('. ')
          : (err.error?.message || 'Ocurrio un error al guardar el usuario');
        this.snackBar.open(msg, 'Cerrar', { duration: 5000 });
      },
    });
  }
}
