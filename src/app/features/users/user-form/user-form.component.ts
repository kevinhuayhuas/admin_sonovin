import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatSlideToggleModule, MatButtonModule,
  ],
  template: `
    <h1 class="text-2xl font-bold mb-4">{{ isEdit ? 'Editar' : 'Nuevo' }} Usuario</h1>
    <mat-card class="max-w-lg">
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-4 p-4">
          <mat-form-field appearance="outline">
            <mat-label>Nombre</mat-label>
            <input matInput formControlName="nombre" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" type="email" />
          </mat-form-field>
          @if (!isEdit) {
            <mat-form-field appearance="outline">
              <mat-label>Contraseña</mat-label>
              <input matInput formControlName="password" type="password" />
            </mat-form-field>
          }
          <mat-form-field appearance="outline">
            <mat-label>Rol</mat-label>
            <mat-select formControlName="role">
              <mat-option value="ADMIN">Admin</mat-option>
              <mat-option value="EDITOR">Editor</mat-option>
              <mat-option value="VIEWER">Viewer</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-slide-toggle formControlName="activo">Activo</mat-slide-toggle>
          <div class="flex gap-4">
            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
              {{ isEdit ? 'Actualizar' : 'Crear' }}
            </button>
            <button mat-button type="button" (click)="router.navigate(['/users'])">Cancelar</button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
})
export class UserFormComponent implements OnInit {
  form: FormGroup;
  isEdit = false;
  userId?: number;

  constructor(private fb: FormBuilder, private userService: UserService, private route: ActivatedRoute, public router: Router, private snackBar: MatSnackBar) {
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
      this.isEdit = true; this.userId = +id;
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.updateValueAndValidity();
      this.userService.getById(this.userId).subscribe({ next: (r: any) => this.form.patchValue(r.data || r) });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const val = { ...this.form.value };
    if (this.isEdit && !val.password) delete val.password;

    const action = this.isEdit ? this.userService.update(this.userId!, val) : this.userService.create(val);
    action.subscribe({
      next: () => { this.snackBar.open(this.isEdit ? 'Actualizado' : 'Creado', 'OK', { duration: 2000 }); this.router.navigate(['/users']); },
      error: (err: any) => this.snackBar.open(err.error?.message || 'Error', 'Cerrar', { duration: 3000 }),
    });
  }
}
