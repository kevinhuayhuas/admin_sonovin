import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ServiceService } from '../../../core/services/service.service';

@Component({
  selector: 'app-service-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <h1 class="text-2xl font-bold mb-4">{{ isEdit ? 'Editar' : 'Nuevo' }} Servicio</h1>
    <mat-card class="max-w-lg">
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-4 p-4">
          <mat-form-field appearance="outline">
            <mat-label>Nombre</mat-label>
            <input matInput formControlName="nombre" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Categoría</mat-label>
            <input matInput formControlName="categoria" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Precio Base</mat-label>
            <input matInput formControlName="precioBase" type="number" />
          </mat-form-field>
          <div class="flex gap-4">
            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
              {{ isEdit ? 'Actualizar' : 'Crear' }}
            </button>
            <button mat-button type="button" (click)="router.navigate(['/services'])">Cancelar</button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
})
export class ServiceFormComponent implements OnInit {
  form: FormGroup;
  isEdit = false;
  serviceId?: number;

  constructor(private fb: FormBuilder, private serviceService: ServiceService, private route: ActivatedRoute, public router: Router, private snackBar: MatSnackBar) {
    this.form = this.fb.group({ nombre: ['', Validators.required], categoria: [''], precioBase: [0, [Validators.required, Validators.min(0)]] });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id && id !== 'new') {
      this.isEdit = true; this.serviceId = +id;
      this.serviceService.getById(this.serviceId).subscribe({ next: (r: any) => this.form.patchValue(r.data || r) });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const action = this.isEdit ? this.serviceService.update(this.serviceId!, this.form.value) : this.serviceService.create(this.form.value);
    action.subscribe({
      next: () => { this.snackBar.open(this.isEdit ? 'Actualizado' : 'Creado', 'OK', { duration: 2000 }); this.router.navigate(['/services']); },
      error: () => this.snackBar.open('Error', 'Cerrar', { duration: 3000 }),
    });
  }
}
