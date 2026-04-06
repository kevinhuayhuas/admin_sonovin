import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { finalize } from 'rxjs';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { ServiceService } from '../../../core/services/service.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ServiceItem } from '../../../core/models/service.model';

@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatTableModule, MatPaginatorModule,
    MatButtonModule, MatIconModule, MatCardModule, MatChipsModule, MatTooltipModule, SkeletonComponent,
  ],
  template: `
    <div class="page-header">
      <div>
        <h1>Servicios</h1>
        <p class="text-slate-500">{{ total }} servicios registrados</p>
      </div>
      <button mat-raised-button color="primary" routerLink="/services/new" class="add-btn">
        <mat-icon>add</mat-icon> Nuevo Servicio
      </button>
    </div>

    <mat-card class="table-card">
      @if (loading) {
        <app-skeleton type="table" [rowCount]="5" [colCount]="4"></app-skeleton>
      } @else if (dataSource.data.length === 0) {
        <div class="empty-state">
          <mat-icon>inventory_2</mat-icon>
          <h3>Sin servicios</h3>
          <p>Agrega tu primer servicio para comenzar</p>
        </div>
      } @else {
        <table mat-table [dataSource]="dataSource" class="w-full">
          <ng-container matColumnDef="nombre">
            <th mat-header-cell *matHeaderCellDef>Servicio</th>
            <td mat-cell *matCellDef="let s">
              <div class="service-cell">
                <div class="service-icon" [class]="getCategoryClass(s.categoria)">
                  <mat-icon>{{ getCategoryIcon(s.categoria) }}</mat-icon>
                </div>
                <span class="font-medium text-slate-900">{{ s.nombre }}</span>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="categoria">
            <th mat-header-cell *matHeaderCellDef>Categoria</th>
            <td mat-cell *matCellDef="let s">
              <span class="category-badge">{{ s.categoria || 'Sin categoria' }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="precioBase">
            <th mat-header-cell *matHeaderCellDef>Precio Base</th>
            <td mat-cell *matCellDef="let s">
              <span class="price">S/ {{ s.precioBase | number:'1.2-2' }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="acciones">
            <th mat-header-cell *matHeaderCellDef style="width: 100px;">Acciones</th>
            <td mat-cell *matCellDef="let s">
              <div class="action-buttons">
                <a mat-icon-button [routerLink]="['/services', s.id, 'edit']" matTooltip="Editar">
                  <mat-icon class="text-amber-500">edit</mat-icon>
                </a>
                <button mat-icon-button (click)="confirmDelete(s)" matTooltip="Eliminar">
                  <mat-icon class="text-red-500">delete_outline</mat-icon>
                </button>
              </div>
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
    .service-cell { display: flex; align-items: center; gap: 12px; padding: 4px 0; }
    .service-icon {
      width: 36px; height: 36px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      mat-icon { font-size: 18px; width: 18px; height: 18px; color: white; }
    }
    .service-icon.hosting { background: linear-gradient(135deg, #3b82f6, #2563eb); }
    .service-icon.dominios { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
    .service-icon.desarrollo { background: linear-gradient(135deg, #f59e0b, #d97706); }
    .service-icon.email { background: linear-gradient(135deg, #22c55e, #16a34a); }
    .service-icon.seguridad { background: linear-gradient(135deg, #ef4444, #dc2626); }
    .service-icon.default { background: linear-gradient(135deg, #64748b, #475569); }
    .category-badge {
      display: inline-block; padding: 4px 10px; border-radius: 6px;
      font-size: 12px; font-weight: 500; background: #f1f5f9; color: #475569;
    }
    .price { font-size: 15px; font-weight: 600; color: #0f172a; }
    .action-buttons { display: flex; gap: 0; }
    .empty-state {
      display: flex; flex-direction: column; align-items: center;
      padding: 48px 24px; color: #94a3b8;
      mat-icon { font-size: 48px; width: 48px; height: 48px; color: #cbd5e1; margin-bottom: 12px; }
      h3 { font-size: 16px; font-weight: 600; color: #475569; margin: 0 0 4px; }
      p { font-size: 14px; margin: 0; }
    }
  `],
})
export class ServiceListComponent implements OnInit {
  columns = ['nombre', 'categoria', 'precioBase', 'acciones'];
  dataSource = new MatTableDataSource<ServiceItem>([]);
  total = 0;
  page = 1;
  loading = true;

  constructor(
    private serviceService: ServiceService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.serviceService.getAll(this.page).pipe(finalize(() => { this.loading = false; this.cdr.detectChanges(); })).subscribe({
      next: (r: any) => {
        this.dataSource.data = r.data?.data || [];
        this.total = r.data?.total || 0;
      },
    });
  }

  onPage(e: PageEvent): void {
    this.page = e.pageIndex + 1;
    this.load();
  }

  confirmDelete(s: ServiceItem): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Eliminar Servicio', message: 'Seguro que deseas eliminar "' + s.nombre + '"?' },
    }).afterClosed().subscribe(ok => {
      if (ok) {
        this.serviceService.delete(s.id).subscribe({
          next: () => {
            this.snackBar.open('Servicio eliminado', 'Cerrar', { duration: 3000 });
            this.load();
          },
        });
      }
    });
  }

  getCategoryIcon(cat: string | undefined): string {
    const icons: Record<string, string> = {
      'Hosting': 'dns', 'Dominios': 'language', 'Desarrollo Web': 'code',
      'Email': 'email', 'Seguridad': 'shield',
    };
    return icons[cat || ''] || 'widgets';
  }

  getCategoryClass(cat: string | undefined): string {
    const classes: Record<string, string> = {
      'Hosting': 'hosting', 'Dominios': 'dominios', 'Desarrollo Web': 'desarrollo',
      'Email': 'email', 'Seguridad': 'seguridad',
    };
    return classes[cat || ''] || 'default';
  }
}
