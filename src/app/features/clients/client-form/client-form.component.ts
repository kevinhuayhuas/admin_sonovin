import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';
import { ClientService } from '../../../core/services/client.service';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule, SkeletonComponent,
  ],
  template: `
    <div class="page-header">
      <div>
        <h1>{{ isEdit ? 'Editar' : 'Nuevo' }} Cliente</h1>
        <p class="text-slate-500">{{ isEdit ? 'Modifica los datos del cliente' : 'Completa la informacion para registrar un nuevo cliente' }}</p>
      </div>
    </div>

    @if (loadingData) {
      <mat-card class="form-card">
        <mat-card-content class="p-6">
          <app-skeleton type="form"></app-skeleton>
        </mat-card-content>
      </mat-card>
    } @else {
      <mat-card class="form-card">
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-grid">
            <mat-form-field appearance="outline" class="col-span-2">
              <mat-label>Nombre completo</mat-label>
              <mat-icon matPrefix>person</mat-icon>
              <input matInput formControlName="nombre" placeholder="Nombre del cliente" />
              @if (form.get('nombre')?.hasError('required') && form.get('nombre')?.touched) {
                <mat-error>El nombre es obligatorio</mat-error>
              }
              @if (form.get('nombre')?.hasError('minlength') && form.get('nombre')?.touched) {
                <mat-error>Minimo 2 caracteres</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Empresa</mat-label>
              <mat-icon matPrefix>business</mat-icon>
              <input matInput formControlName="empresa" placeholder="Nombre de la empresa" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>RUC / DNI</mat-label>
              <mat-icon matPrefix>badge</mat-icon>
              <input matInput formControlName="rucDni" placeholder="Ej: 20512345678" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <mat-icon matPrefix>email</mat-icon>
              <input matInput formControlName="email" type="email" placeholder="correo&#64;empresa.com" />
              @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
                <mat-error>Ingresa un email valido</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>WhatsApp</mat-label>
              <mat-icon matPrefix>phone</mat-icon>
              <input matInput formControlName="whatsapp" placeholder="Ej: +51 999888777" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="col-span-2">
              <mat-label>Notas</mat-label>
              <mat-icon matPrefix>notes</mat-icon>
              <textarea matInput formControlName="notas" rows="3" placeholder="Observaciones adicionales..."></textarea>
            </mat-form-field>

            <div class="col-span-2 form-actions">
              <button type="submit" class="submit-btn" [disabled]="form.invalid || saving">
                @if (saving) {
                  <mat-spinner diameter="18"></mat-spinner>
                  <span>{{ isEdit ? 'Actualizando...' : 'Creando...' }}</span>
                } @else {
                  <mat-icon>{{ isEdit ? 'save' : 'person_add' }}</mat-icon>
                  <span>{{ isEdit ? 'Guardar cambios' : 'Crear cliente' }}</span>
                }
              </button>
              <button type="button" class="cancel-btn" (click)="cancel()" [disabled]="saving">
                Cancelar
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    }
  `,
  styles: [`
    .page-header {
      margin-bottom: 24px;
      h1 { font-size: 26px; font-weight: 700; color: #0f172a; margin: 0; }
    }
    .form-card { max-width: 720px; padding: 0 !important; overflow: hidden; }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 16px;
      padding: 24px;
    }
    .col-span-2 { grid-column: span 2; }
    .form-actions {
      display: flex; gap: 12px; margin-top: 8px; padding-top: 16px;
      border-top: 1px solid #f1f5f9;
    }
    .submit-btn {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      height: 44px; padding: 0 24px;
      background: linear-gradient(135deg, #7c3aed, #6d28d9);
      color: white; border: none; border-radius: 10px;
      font-size: 14px; font-weight: 600; cursor: pointer;
      transition: all 0.2s; box-shadow: 0 2px 8px rgba(124,58,237,0.25);
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
      &:hover:not(:disabled) { box-shadow: 0 4px 16px rgba(124,58,237,0.35); transform: translateY(-1px); }
      &:disabled { background: #e2e8f0; color: #94a3b8; box-shadow: none; cursor: not-allowed; }
    }
    .cancel-btn {
      height: 44px; padding: 0 20px;
      background: transparent; border: 1px solid #e2e8f0; border-radius: 10px;
      color: #64748b; font-size: 14px; font-weight: 500; cursor: pointer;
      transition: all 0.15s;
      &:hover { background: #f8fafc; border-color: #cbd5e1; }
    }
    @media (max-width: 640px) {
      .form-grid { grid-template-columns: 1fr; padding: 16px; }
      .col-span-2 { grid-column: span 1; }
      .page-header h1 { font-size: 22px; }
      .form-card { max-width: 100%; }
      .form-actions { flex-direction: column; }
      .submit-btn, .cancel-btn { width: 100%; justify-content: center; }
    }
  `],
})
export class ClientFormComponent implements OnInit {
  form: FormGroup;
  isEdit = false;
  clientId?: number;
  saving = false;
  loadingData = false;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      empresa: [''],
      rucDni: [''],
      email: ['', Validators.email],
      whatsapp: [''],
      notas: [''],
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id && id !== 'new') {
      this.isEdit = true;
      this.clientId = +id;
      this.loadingData = true;
      this.clientService.getById(this.clientId)
        .pipe(finalize(() => { this.loadingData = false; this.cdr.detectChanges(); }))
        .subscribe({
          next: (res: any) => this.form.patchValue(res.data || res),
          error: () => {
            this.snackBar.open('No se pudo cargar el cliente. Verifica que exista.', 'Cerrar', { duration: 4000 });
            this.router.navigate(['/clients']);
          },
        });
    }
  }

  onSubmit(): void {
    if (this.form.invalid || this.saving) return;
    this.saving = true;

    const clientName = this.form.value.nombre;
    const action = this.isEdit
      ? this.clientService.update(this.clientId!, this.form.value)
      : this.clientService.create(this.form.value);

    action.pipe(finalize(() => { this.saving = false; this.cdr.detectChanges(); })).subscribe({
      next: () => {
        this.snackBar.open(
          this.isEdit
            ? `"${clientName}" actualizado correctamente`
            : `Cliente "${clientName}" creado exitosamente`,
          'OK',
          { duration: 3000 },
        );
        this.router.navigate(['/clients']);
      },
      error: (err) => {
        const msg = this.getErrorMessage(err);
        this.snackBar.open(msg, 'Cerrar', { duration: 5000 });
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/clients']);
  }

  private getErrorMessage(err: any): string {
    const status = err.status;
    const serverMsg = err.error?.message;

    // Validation errors from class-validator (array of messages)
    if (Array.isArray(serverMsg)) {
      return serverMsg.join('. ');
    }

    // Specific HTTP status handling
    switch (status) {
      case 400:
        return serverMsg || 'Datos invalidos. Revisa los campos del formulario.';
      case 401:
        return 'Sesion expirada. Inicia sesion nuevamente.';
      case 403:
        return 'No tienes permisos para realizar esta accion.';
      case 404:
        return 'El cliente no fue encontrado. Puede haber sido eliminado.';
      case 409:
        return serverMsg || 'Ya existe un cliente con estos datos.';
      case 422:
        return serverMsg || 'Los datos enviados no son validos.';
      case 0:
        return 'Sin conexion al servidor. Verifica tu conexion a internet.';
      default:
        if (status >= 500) {
          return 'Error interno del servidor. Intenta nuevamente en unos minutos.';
        }
        return serverMsg || 'Ocurrio un error inesperado. Intenta nuevamente.';
    }
  }
}
