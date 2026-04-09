import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize, forkJoin } from 'rxjs';
import { PaymentService } from '../../../core/services/payment.service';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { Subscription } from '../../../core/models/subscription.model';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatDatepickerModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, SkeletonComponent,
  ],
  template: `
    <div class="page-header">
      <div>
        <h1>{{ isEdit ? 'Editar' : 'Registrar' }} Pago</h1>
        <p class="text-slate-500">{{ isEdit ? 'Modifica los datos del pago' : 'Registra un nuevo pago para una suscripcion' }}</p>
      </div>
    </div>

    @if (loadingData) {
      <mat-card class="form-card"><mat-card-content class="p-6"><app-skeleton type="form"></app-skeleton></mat-card-content></mat-card>
    } @else {
      <mat-card class="form-card">
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-grid">
            <mat-form-field appearance="outline" class="col-span-2">
              <mat-label>Suscripcion</mat-label>
              <mat-icon matPrefix>card_membership</mat-icon>
              <mat-select formControlName="subscriptionId">
                @for (s of subscriptions; track s.id) {
                  <mat-option [value]="s.id">
                    {{ s.client?.nombre }} - {{ s.dominio || 'Sin dominio' }} ({{ s.service?.nombre }})
                  </mat-option>
                }
              </mat-select>
              @if (form.get('subscriptionId')?.hasError('required') && form.get('subscriptionId')?.touched) {
                <mat-error>Selecciona una suscripcion</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Monto (S/)</mat-label>
              <mat-icon matPrefix>payments</mat-icon>
              <input matInput formControlName="monto" type="number" placeholder="0.00" />
              @if (form.get('monto')?.hasError('min')) {
                <mat-error>El monto debe ser mayor a 0</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Metodo de Pago</mat-label>
              <mat-icon matPrefix>account_balance_wallet</mat-icon>
              <mat-select formControlName="metodoPago">
                <mat-option value="TRANSFERENCIA">Transferencia</mat-option>
                <mat-option value="EFECTIVO">Efectivo</mat-option>
                <mat-option value="YAPE">Yape</mat-option>
                <mat-option value="PLIN">Plin</mat-option>
                <mat-option value="TARJETA">Tarjeta</mat-option>
                <mat-option value="OTRO">Otro</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Estado</mat-label>
              <mat-icon matPrefix>flag</mat-icon>
              <mat-select formControlName="estado">
                <mat-option value="PENDIENTE">Pendiente</mat-option>
                <mat-option value="PAGADO">Pagado (renueva suscripcion)</mat-option>
                <mat-option value="ANULADO">Anulado</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Fecha Limite de Pago</mat-label>
              <input matInput [matDatepicker]="dpVenc" formControlName="fechaVencimientoPago" />
              <mat-datepicker-toggle matSuffix [for]="dpVenc"></mat-datepicker-toggle>
              <mat-datepicker #dpVenc></mat-datepicker>
              @if (form.get('fechaVencimientoPago')?.hasError('required') && form.get('fechaVencimientoPago')?.touched) {
                <mat-error>La fecha limite es obligatoria</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Fecha de Pago</mat-label>
              <input matInput [matDatepicker]="dpPago" formControlName="fechaPago" />
              <mat-datepicker-toggle matSuffix [for]="dpPago"></mat-datepicker-toggle>
              <mat-datepicker #dpPago></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>N° Comprobante</mat-label>
              <mat-icon matPrefix>receipt</mat-icon>
              <input matInput formControlName="numeroComprobante" placeholder="001-0001234" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="col-span-2">
              <mat-label>Nota</mat-label>
              <mat-icon matPrefix>notes</mat-icon>
              <textarea matInput formControlName="nota" rows="2" placeholder="Observaciones..."></textarea>
            </mat-form-field>

            <div class="col-span-2 form-actions">
              <button type="submit" class="submit-btn" [disabled]="form.invalid || saving">
                @if (saving) {
                  <mat-spinner diameter="18"></mat-spinner>
                  <span>{{ isEdit ? 'Guardando...' : 'Registrando...' }}</span>
                } @else {
                  <mat-icon>{{ isEdit ? 'save' : 'add_circle' }}</mat-icon>
                  <span>{{ isEdit ? 'Guardar cambios' : 'Registrar pago' }}</span>
                }
              </button>
              <button type="button" class="cancel-btn" (click)="router.navigate(['/payments'])" [disabled]="saving">Cancelar</button>
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
      border-radius: 10px; color: #64748b; font-size: 14px; cursor: pointer;
      &:hover { background: #f8fafc; }
    }
    @media (max-width: 640px) {
      .form-grid { grid-template-columns: 1fr; padding: 16px; }
      .col-span-2 { grid-column: span 1; }
      .form-actions { flex-direction: column; }
      .submit-btn, .cancel-btn { width: 100%; justify-content: center; }
    }
  `],
})
export class PaymentFormComponent implements OnInit {
  form: FormGroup;
  isEdit = false;
  paymentId?: number;
  subscriptions: Subscription[] = [];
  saving = false;
  loadingData = true;

  constructor(
    private fb: FormBuilder, private paymentService: PaymentService,
    private subscriptionService: SubscriptionService,
    private route: ActivatedRoute, public router: Router,
    private snackBar: MatSnackBar, private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      subscriptionId: [null, Validators.required],
      monto: [0, [Validators.required, Validators.min(0.01)]],
      metodoPago: ['TRANSFERENCIA', Validators.required],
      estado: ['PENDIENTE'],
      fechaVencimientoPago: ['', Validators.required],
      fechaPago: [''],
      numeroComprobante: [''],
      nota: [''],
    });
  }

  ngOnInit(): void {
    // Load subscriptions
    this.subscriptionService.getAll(1, 200)
      .pipe(finalize(() => { this.loadingData = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: (r: any) => this.subscriptions = r.data?.data || [],
      });

    const id = this.route.snapshot.params['id'];
    if (id && id !== 'new') {
      this.isEdit = true;
      this.paymentId = +id;
      this.paymentService.getById(this.paymentId).subscribe({
        next: (r: any) => this.form.patchValue(r.data || r),
        error: () => {
          this.snackBar.open('No se pudo cargar el pago.', 'Cerrar', { duration: 4000 });
          this.router.navigate(['/payments']);
        },
      });
    }

    // Pre-fill subscriptionId from query param
    const subId = this.route.snapshot.queryParams['subscriptionId'];
    if (subId) this.form.patchValue({ subscriptionId: +subId });
  }

  onSubmit(): void {
    if (this.form.invalid || this.saving) return;
    this.saving = true;
    const val = { ...this.form.value };

    // Convert moment/Date to YYYY-MM-DD
    if (val.fechaVencimientoPago?.format) val.fechaVencimientoPago = val.fechaVencimientoPago.format('YYYY-MM-DD');
    else if (val.fechaVencimientoPago instanceof Date) val.fechaVencimientoPago = val.fechaVencimientoPago.toISOString().split('T')[0];
    if (val.fechaPago?.format) val.fechaPago = val.fechaPago.format('YYYY-MM-DD');
    else if (val.fechaPago instanceof Date) val.fechaPago = val.fechaPago.toISOString().split('T')[0];
    if (!val.fechaPago) delete val.fechaPago;

    const action = this.isEdit
      ? this.paymentService.update(this.paymentId!, val)
      : this.paymentService.create(val);

    action.pipe(finalize(() => { this.saving = false; this.cdr.detectChanges(); })).subscribe({
      next: () => {
        const msg = this.isEdit
          ? 'Pago actualizado correctamente'
          : val.estado === 'PAGADO'
            ? 'Pago registrado y suscripcion renovada automaticamente'
            : 'Pago registrado como pendiente';
        this.snackBar.open(msg, 'OK', { duration: 4000 });
        this.router.navigate(['/payments']);
      },
      error: (err) => {
        const msg = Array.isArray(err.error?.message)
          ? err.error.message.join('. ')
          : (err.error?.message || 'Error al guardar el pago');
        this.snackBar.open(msg, 'Cerrar', { duration: 5000 });
      },
    });
  }
}
