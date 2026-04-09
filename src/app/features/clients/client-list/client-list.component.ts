import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { finalize } from 'rxjs';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { ClientService } from '../../../core/services/client.service';
import { AuthService } from '../../../core/services/auth.service';
import { HasRoleDirective } from '../../../shared/directives/has-role.directive';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Client } from '../../../core/models/client.model';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatDialogModule, HasRoleDirective,
    MatTooltipModule, MatChipsModule, MatCardModule, SkeletonComponent,
  ],
  template: `
    <div class="page-header">
      <div>
        <h1>Clientes</h1>
        <p class="text-slate-500">{{ total }} clientes registrados</p>
      </div>
      <button *appHasRole="['ADMIN', 'EDITOR']" mat-raised-button color="primary"
              routerLink="/clients/new" class="add-btn">
        <mat-icon>add</mat-icon> Nuevo Cliente
      </button>
    </div>

    <mat-card class="table-card">
      <div class="search-bar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-icon matPrefix>search</mat-icon>
          <input matInput [(ngModel)]="search" (keyup.enter)="loadClients()"
                 placeholder="Buscar por nombre, empresa o email..." />
          @if (search) {
            <button mat-icon-button matSuffix (click)="search = ''; loadClients()">
              <mat-icon>close</mat-icon>
            </button>
          }
        </mat-form-field>
      </div>

      @if (loading) {
        <app-skeleton type="table" [rowCount]="5" [colCount]="5"></app-skeleton>
      } @else if (dataSource.data.length === 0) {
        <div class="empty-state">
          <mat-icon>people_outline</mat-icon>
          <h3>Sin resultados</h3>
          <p>{{ search ? 'No se encontraron clientes con ese criterio' : 'Agrega tu primer cliente' }}</p>
        </div>
      } @else {
        <div class="mobile-cards">
        <table mat-table [dataSource]="dataSource" class="w-full">
          <ng-container matColumnDef="nombre">
            <th mat-header-cell *matHeaderCellDef>Cliente</th>
            <td mat-cell *matCellDef="let c" data-label="Cliente">
              <div class="client-cell">
                <div class="client-avatar">{{ c.nombre?.charAt(0) }}</div>
                <div>
                  <div class="font-medium text-slate-900">{{ c.nombre }}</div>
                  <div class="text-xs text-slate-500">{{ c.empresa || '' }}</div>
                </div>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>Email</th>
            <td mat-cell *matCellDef="let c" data-label="Email">
              <span class="text-slate-600">{{ c.email || '-' }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="whatsapp">
            <th mat-header-cell *matHeaderCellDef>WhatsApp</th>
            <td mat-cell *matCellDef="let c" data-label="WhatsApp">
              <span class="text-slate-600">{{ c.whatsapp || '-' }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="rucDni">
            <th mat-header-cell *matHeaderCellDef>RUC/DNI</th>
            <td mat-cell *matCellDef="let c" data-label="RUC/DNI">
              <span class="text-slate-500 text-sm">{{ c.rucDni || '-' }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="acciones">
            <th mat-header-cell *matHeaderCellDef style="width: 120px;">Acciones</th>
            <td mat-cell *matCellDef="let c">
              <div class="action-buttons">
                <a mat-icon-button [routerLink]="['/clients', c.id]" matTooltip="Ver detalle">
                  <mat-icon class="text-blue-500">visibility</mat-icon>
                </a>
                <a *appHasRole="['ADMIN', 'EDITOR']" mat-icon-button
                   [routerLink]="['/clients', c.id, 'edit']" matTooltip="Editar">
                  <mat-icon class="text-amber-500">edit</mat-icon>
                </a>
                <button *appHasRole="['ADMIN']" mat-icon-button
                        (click)="confirmDelete(c)" matTooltip="Eliminar">
                  <mat-icon class="text-red-500">delete_outline</mat-icon>
                </button>
              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
        </div>
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
    .search-bar { padding: 16px 20px 0; }
    .search-field { width: 100%; }
    .client-cell { display: flex; align-items: center; gap: 12px; padding: 4px 0; }
    .client-avatar {
      width: 36px; height: 36px;
      background: linear-gradient(135deg, #7c3aed, #a78bfa);
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 600; font-size: 14px;
    }
    .action-buttons { display: flex; gap: 0; }
    .empty-state {
      display: flex; flex-direction: column; align-items: center;
      padding: 48px 24px; color: #94a3b8;
      mat-icon { font-size: 48px; width: 48px; height: 48px; color: #cbd5e1; margin-bottom: 12px; }
      h3 { font-size: 16px; font-weight: 600; color: #475569; margin: 0 0 4px; }
      p { font-size: 14px; margin: 0; }
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column; gap: 12px;
        h1 { font-size: 22px; }
      }
      .add-btn { width: 100%; justify-content: center; }
      .search-bar { padding: 12px 12px 0; }
      table { display: block; overflow-x: auto; -webkit-overflow-scrolling: touch; }
    }
  `],
})
export class ClientListComponent implements OnInit {
  displayedColumns = ['nombre', 'email', 'whatsapp', 'rucDni', 'acciones'];
  dataSource = new MatTableDataSource<Client>([]);
  total = 0;
  search = '';
  page = 1;
  limit = 10;
  loading = true;

  constructor(
    private clientService: ClientService,
    public authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void { this.loadClients(); }

  loadClients(): void {
    this.loading = true;
    this.clientService.getAll(this.page, this.limit, this.search)
      .pipe(finalize(() => { this.loading = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: (res: any) => {
          this.dataSource.data = res.data?.data || res.data || [];
          this.total = res.data?.total || 0;
        },
      });
  }

  onPage(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.limit = event.pageSize;
    this.loadClients();
  }

  confirmDelete(client: Client): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar Cliente',
        message: 'Estas seguro de eliminar a "' + client.nombre + '"? Esta accion no se puede deshacer.',
      },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.clientService.delete(client.id).subscribe({
          next: () => {
            this.snackBar.open('Cliente eliminado correctamente', 'Cerrar', { duration: 3000 });
            this.loadClients();
          },
        });
      }
    });
  }
}
