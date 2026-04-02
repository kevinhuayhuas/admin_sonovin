import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatTableModule, MatPaginatorModule,
    MatButtonModule, MatIconModule, MatCardModule, MatTooltipModule,
  ],
  template: `
    <div class="page-header">
      <div>
        <h1>Usuarios</h1>
        <p class="text-slate-500">{{ total }} usuarios registrados</p>
      </div>
      <button mat-raised-button color="primary" routerLink="/users/new" class="add-btn">
        <mat-icon>person_add</mat-icon> Nuevo Usuario
      </button>
    </div>

    <mat-card class="table-card">
      @if (dataSource.data.length === 0 && !loading) {
        <div class="empty-state">
          <mat-icon>manage_accounts</mat-icon>
          <h3>Sin usuarios</h3>
          <p>Crea el primer usuario del sistema</p>
        </div>
      } @else {
        <table mat-table [dataSource]="dataSource" class="w-full">
          <ng-container matColumnDef="nombre">
            <th mat-header-cell *matHeaderCellDef>Usuario</th>
            <td mat-cell *matCellDef="let u">
              <div class="user-cell">
                <div class="user-avatar">{{ u.nombre?.charAt(0) }}</div>
                <div>
                  <div class="font-medium text-slate-900">{{ u.nombre }}</div>
                  <div class="text-xs text-slate-500">{{ u.email }}</div>
                </div>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="role">
            <th mat-header-cell *matHeaderCellDef>Rol</th>
            <td mat-cell *matCellDef="let u">
              <span [class]="'role-badge role-' + u.role.toLowerCase()">{{ u.role }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="activo">
            <th mat-header-cell *matHeaderCellDef>Estado</th>
            <td mat-cell *matCellDef="let u">
              <span [class]="'status-pill ' + (u.activo ? 'active' : 'inactive')">
                <span class="dot"></span>
                {{ u.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="acciones">
            <th mat-header-cell *matHeaderCellDef style="width: 80px;">Acciones</th>
            <td mat-cell *matCellDef="let u">
              <a mat-icon-button [routerLink]="['/users', u.id, 'edit']" matTooltip="Editar usuario">
                <mat-icon class="text-amber-500">edit</mat-icon>
              </a>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
        </table>
      }

      <mat-paginator [length]="total" [pageSize]="10" [pageSizeOptions]="[5, 10, 25]"
                     (page)="onPage($event)" showFirstLastButtons></mat-paginator>
    </mat-card>
  `,
  styles: [`
    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;
      h1 { font-size: 26px; font-weight: 700; color: #0f172a; margin: 0; }
    }
    .add-btn { border-radius: 10px !important; height: 42px; padding: 0 20px !important; }
    .table-card { padding: 0 !important; overflow: hidden; }
    .user-cell { display: flex; align-items: center; gap: 12px; padding: 4px 0; }
    .user-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: linear-gradient(135deg, #7c3aed, #a78bfa);
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 600; font-size: 14px;
    }
    .role-badge {
      display: inline-block; padding: 4px 10px; border-radius: 6px;
      font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
    }
    .role-admin { background: #fef2f2; color: #dc2626; }
    .role-editor { background: #fffbeb; color: #d97706; }
    .role-viewer { background: #f0fdf4; color: #16a34a; }
    .status-pill {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 500;
    }
    .status-pill .dot { width: 6px; height: 6px; border-radius: 50%; }
    .status-pill.active { background: #f0fdf4; color: #16a34a; .dot { background: #22c55e; } }
    .status-pill.inactive { background: #fef2f2; color: #dc2626; .dot { background: #ef4444; } }
    .empty-state {
      display: flex; flex-direction: column; align-items: center;
      padding: 48px 24px; color: #94a3b8;
      mat-icon { font-size: 48px; width: 48px; height: 48px; color: #cbd5e1; margin-bottom: 12px; }
      h3 { font-size: 16px; font-weight: 600; color: #475569; margin: 0 0 4px; }
      p { font-size: 14px; margin: 0; }
    }
  `],
})
export class UserListComponent implements OnInit {
  columns = ['nombre', 'role', 'activo', 'acciones'];
  dataSource = new MatTableDataSource<User>([]);
  total = 0;
  page = 1;
  loading = true;

  constructor(private userService: UserService) {}
  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.userService.getAll(this.page).subscribe({
      next: (r: any) => {
        this.dataSource.data = r.data?.data || [];
        this.total = r.data?.total || 0;
        this.loading = false;
      },
    });
  }

  onPage(e: PageEvent): void { this.page = e.pageIndex + 1; this.load(); }
}
