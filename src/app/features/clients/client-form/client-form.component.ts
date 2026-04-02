import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClientService } from '../../../core/services/client.service';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule,
  ],
  template: `
    <h1 class="text-2xl font-bold mb-4">{{ isEdit ? 'Editar' : 'Nuevo' }} Cliente</h1>
    <mat-card class="max-w-2xl">
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          <mat-form-field appearance="outline" class="col-span-2">
            <mat-label>Nombre</mat-label>
            <input matInput formControlName="nombre" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Empresa</mat-label>
            <input matInput formControlName="empresa" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>RUC / DNI</mat-label>
            <input matInput formControlName="rucDni" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" type="email" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>WhatsApp</mat-label>
            <input matInput formControlName="whatsapp" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="col-span-2">
            <mat-label>Notas</mat-label>
            <textarea matInput formControlName="notas" rows="3"></textarea>
          </mat-form-field>

          <div class="col-span-2 flex gap-4">
            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
              {{ isEdit ? 'Actualizar' : 'Crear' }}
            </button>
            <button mat-button type="button" (click)="cancel()">Cancelar</button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
})
export class ClientFormComponent implements OnInit {
  form: FormGroup;
  isEdit = false;
  clientId?: number;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
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
      this.clientService.getById(this.clientId).subscribe({
        next: (res: any) => {
          const client = res.data || res;
          this.form.patchValue(client);
        },
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const action = this.isEdit
      ? this.clientService.update(this.clientId!, this.form.value)
      : this.clientService.create(this.form.value);

    action.subscribe({
      next: () => {
        this.snackBar.open(
          `Cliente ${this.isEdit ? 'actualizado' : 'creado'}`,
          'Cerrar',
          { duration: 2000 },
        );
        this.router.navigate(['/clients']);
      },
      error: () => {
        this.snackBar.open('Error al guardar', 'Cerrar', { duration: 3000 });
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/clients']);
  }
}
