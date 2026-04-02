import { Component, OnInit } from '@angular/core';
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { ClientService } from '../../../core/services/client.service';
import { ServiceService } from '../../../core/services/service.service';
import { Client } from '../../../core/models/client.model';
import { ServiceItem } from '../../../core/models/service.model';

@Component({
  selector: 'app-subscription-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatSlideToggleModule, MatButtonModule,
  ],
  template: `
    <h1 class="text-2xl font-bold mb-4">{{ isEdit ? 'Editar' : 'Nueva' }} Suscripción</h1>
    <mat-card class="max-w-2xl">
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          <mat-form-field appearance="outline">
            <mat-label>Cliente</mat-label>
            <mat-select formControlName="clientId">
              @for (c of clients; track c.id) {
                <mat-option [value]="c.id">{{ c.nombre }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Servicio</mat-label>
            <mat-select formControlName="serviceId">
              @for (s of services; track s.id) {
                <mat-option [value]="s.id">{{ s.nombre }} - S/{{ s.precioBase }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Dominio</mat-label>
            <input matInput formControlName="dominio" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Proveedor Dominio</mat-label>
            <input matInput formControlName="proveedorDominio" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Fecha Inicio</mat-label>
            <input matInput [matDatepicker]="dpInicio" formControlName="fechaInicio" />
            <mat-datepicker-toggle matSuffix [for]="dpInicio"></mat-datepicker-toggle>
            <mat-datepicker #dpInicio></mat-datepicker>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Fecha Vencimiento</mat-label>
            <input matInput [matDatepicker]="dpVenc" formControlName="fechaVencimiento" />
            <mat-datepicker-toggle matSuffix [for]="dpVenc"></mat-datepicker-toggle>
            <mat-datepicker #dpVenc></mat-datepicker>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Costo Anual</mat-label>
            <input matInput formControlName="costoAnual" type="number" />
          </mat-form-field>
          <div class="flex items-center">
            <mat-slide-toggle formControlName="gestionadoPorMi">Gestionado por mí</mat-slide-toggle>
          </div>
          <div class="col-span-2 flex gap-4">
            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
              {{ isEdit ? 'Actualizar' : 'Crear' }}
            </button>
            <button mat-button type="button" (click)="router.navigate(['/subscriptions'])">Cancelar</button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
})
export class SubscriptionFormComponent implements OnInit {
  form: FormGroup;
  isEdit = false;
  subId?: number;
  clients: Client[] = [];
  services: ServiceItem[] = [];

  constructor(
    private fb: FormBuilder, private subService: SubscriptionService,
    private clientService: ClientService, private serviceService: ServiceService,
    private route: ActivatedRoute, public router: Router, private snackBar: MatSnackBar,
  ) {
    this.form = this.fb.group({
      clientId: [null, Validators.required], serviceId: [null, Validators.required],
      dominio: [''], proveedorDominio: [''], gestionadoPorMi: [false],
      costoAnual: [0, [Validators.required, Validators.min(0)]],
      fechaInicio: ['', Validators.required], fechaVencimiento: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.clientService.getAll(1, 100).subscribe({ next: (r: any) => this.clients = r.data?.data || [] });
    this.serviceService.getAll(1, 100).subscribe({ next: (r: any) => this.services = r.data?.data || [] });
    const id = this.route.snapshot.params['id'];
    if (id && id !== 'new') {
      this.isEdit = true; this.subId = +id;
      this.subService.getById(this.subId).subscribe({ next: (r: any) => this.form.patchValue(r.data || r) });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const val = { ...this.form.value };
    if (val.fechaInicio instanceof Date) val.fechaInicio = val.fechaInicio.toISOString().split('T')[0];
    if (val.fechaVencimiento instanceof Date) val.fechaVencimiento = val.fechaVencimiento.toISOString().split('T')[0];

    const action = this.isEdit ? this.subService.update(this.subId!, val) : this.subService.create(val);
    action.subscribe({
      next: () => { this.snackBar.open(this.isEdit ? 'Actualizado' : 'Creado', 'OK', { duration: 2000 }); this.router.navigate(['/subscriptions']); },
      error: () => this.snackBar.open('Error', 'Cerrar', { duration: 3000 }),
    });
  }
}
