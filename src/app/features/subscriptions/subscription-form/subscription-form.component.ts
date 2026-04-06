import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize, forkJoin } from 'rxjs';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { ClientService } from '../../../core/services/client.service';
import { ServiceService } from '../../../core/services/service.service';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { Client } from '../../../core/models/client.model';
import { ServiceItem } from '../../../core/models/service.model';

@Component({
  selector: 'app-subscription-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatSlideToggleModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, SkeletonComponent,
  ],
  template: `
    <div class="page-header">
      <div>
        <h1>{{ isEdit ? 'Editar' : 'Nueva' }} Suscripcion</h1>
        <p class="text-slate-500">{{ isEdit ? 'Modifica los datos de la suscripcion' : 'Asocia un servicio a un cliente' }}</p>
      </div>
    </div>

    @if (loadingData) {
      <mat-card class="form-card"><mat-card-content class="p-6"><app-skeleton type="form"></app-skeleton></mat-card-content></mat-card>
    } @else {
      <mat-card class="form-card">
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Cliente</mat-label>
              <mat-icon matPrefix>person</mat-icon>
              <mat-select formControlName="clientId">
                @for (c of clients; track c.id) {
                  <mat-option [value]="c.id">{{ c.nombre }}</mat-option>
                }
              </mat-select>
              @if (form.get('clientId')?.hasError('required') && form.get('clientId')?.touched) {
                <mat-error>Selecciona un cliente</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Servicio</mat-label>
              <mat-icon matPrefix>inventory_2</mat-icon>
              <mat-select formControlName="serviceId">
                @for (s of services; track s.id) {
                  <mat-option [value]="s.id">{{ s.nombre }} - S/{{ s.precioBase }}</mat-option>
                }
              </mat-select>
              @if (form.get('serviceId')?.hasError('required') && form.get('serviceId')?.touched) {
                <mat-error>Selecciona un servicio</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Dominio</mat-label>
              <mat-icon matPrefix>language</mat-icon>
              <input matInput formControlName="dominio" placeholder="ejemplo.com" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Proveedor Dominio</mat-label>
              <mat-icon matPrefix>dns</mat-icon>
              <input matInput formControlName="proveedorDominio" placeholder="GoDaddy, Namecheap..." />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Fecha Inicio</mat-label>
              <input matInput [matDatepicker]="dpInicio" formControlName="fechaInicio" />
              <mat-datepicker-toggle matSuffix [for]="dpInicio"></mat-datepicker-toggle>
              <mat-datepicker #dpInicio></mat-datepicker>
              @if (form.get('fechaInicio')?.hasError('required') && form.get('fechaInicio')?.touched) {
                <mat-error>La fecha de inicio es obligatoria</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Fecha Vencimiento</mat-label>
              <input matInput [matDatepicker]="dpVenc" formControlName="fechaVencimiento" />
              <mat-datepicker-toggle matSuffix [for]="dpVenc"></mat-datepicker-toggle>
              <mat-datepicker #dpVenc></mat-datepicker>
              @if (form.get('fechaVencimiento')?.hasError('required') && form.get('fechaVencimiento')?.touched) {
                <mat-error>La fecha de vencimiento es obligatoria</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Costo Anual (S/)</mat-label>
              <mat-icon matPrefix>payments</mat-icon>
              <input matInput formControlName="costoAnual" type="number" placeholder="0.00" />
            </mat-form-field>

            <div class="flex items-center pt-4">
              <mat-slide-toggle formControlName="gestionadoPorMi">Gestionado por mi</mat-slide-toggle>
            </div>

            <div class="col-span-2 form-actions">
              <button type="submit" class="submit-btn" [disabled]="form.invalid || saving">
                @if (saving) {
                  <mat-spinner diameter="18"></mat-spinner>
                  <span>{{ isEdit ? 'Guardando...' : 'Creando...' }}</span>
                } @else {
                  <mat-icon>{{ isEdit ? 'save' : 'add_circle' }}</mat-icon>
                  <span>{{ isEdit ? 'Guardar cambios' : 'Crear suscripcion' }}</span>
                }
              </button>
              <button type="button" class="cancel-btn" (click)="router.navigate(['/subscriptions'])" [disabled]="saving">Cancelar</button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    }
  `,
  styles: [`
    .page-header { margin-bottom: 24px; h1 { font-size: 26px; font-weight: 700; color: #0f172a; margin: 0; } }
    .form-card { max-width: 720px; padding: 0 !important; overflow: hidden; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; padding: 24px; }
    .col-span-2 { grid-column: span 2; }
    .form-actions { display: flex; gap: 12px; margin-top: 8px; padding-top: 16px; border-top: 1px solid #f1f5f9; }
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
    @media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } .col-span-2 { grid-column: span 1; } }
  `],
})
export class SubscriptionFormComponent implements OnInit {
  form: FormGroup;
  isEdit = false;
  subId?: number;
  clients: Client[] = [];
  services: ServiceItem[] = [];
  saving = false;
  loadingData = true;

  constructor(
    private fb: FormBuilder, private subService: SubscriptionService,
    private clientService: ClientService, private serviceService: ServiceService,
    private route: ActivatedRoute, public router: Router,
    private snackBar: MatSnackBar, private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      clientId: [null, Validators.required],
      serviceId: [null, Validators.required],
      dominio: [''],
      proveedorDominio: [''],
      gestionadoPorMi: [false],
      costoAnual: [0, [Validators.required, Validators.min(0)]],
      fechaInicio: ['', Validators.required],
      fechaVencimiento: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];

    // Load clients and services in parallel
    forkJoin({
      clients: this.clientService.getAll(1, 200),
      services: this.serviceService.getAll(1, 200),
    }).pipe(finalize(() => { this.loadingData = false; this.cdr.detectChanges(); })).subscribe({
      next: ({ clients, services }: any) => {
        this.clients = clients.data?.data || [];
        this.services = services.data?.data || [];
      },
    });

    if (id && id !== 'new') {
      this.isEdit = true;
      this.subId = +id;
      this.subService.getById(this.subId).subscribe({
        next: (r: any) => this.form.patchValue(r.data || r),
        error: () => {
          this.snackBar.open('No se pudo cargar la suscripcion.', 'Cerrar', { duration: 4000 });
          this.router.navigate(['/subscriptions']);
        },
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid || this.saving) return;
    this.saving = true;

    const val = { ...this.form.value };
    if (val.fechaInicio instanceof Date) val.fechaInicio = val.fechaInicio.toISOString().split('T')[0];
    if (val.fechaVencimiento instanceof Date) val.fechaVencimiento = val.fechaVencimiento.toISOString().split('T')[0];

    const domain = val.dominio || 'sin dominio';
    const action = this.isEdit ? this.subService.update(this.subId!, val) : this.subService.create(val);

    action.pipe(finalize(() => { this.saving = false; this.cdr.detectChanges(); })).subscribe({
      next: () => {
        this.snackBar.open(
          this.isEdit
            ? `Suscripcion de "${domain}" actualizada correctamente`
            : `Suscripcion para "${domain}" creada exitosamente`,
          'OK', { duration: 3000 },
        );
        this.router.navigate(['/subscriptions']);
      },
      error: (err) => {
        const msg = Array.isArray(err.error?.message)
          ? err.error.message.join('. ')
          : (err.error?.message || 'Ocurrio un error al guardar la suscripcion');
        this.snackBar.open(msg, 'Cerrar', { duration: 5000 });
      },
    });
  }
}
