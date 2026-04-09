import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';
import { PaymentService } from '../../../core/services/payment.service';
import { AuthService } from '../../../core/services/auth.service';
import { HasRoleDirective } from '../../../shared/directives/has-role.directive';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Payment } from '../../../core/models/payment.model';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatTableModule, MatPaginatorModule,
    MatButtonModule, MatIconModule, MatCardModule, MatTooltipModule,
    MatButtonToggleModule, HasRoleDirective, DateFormatPipe, SkeletonComponent,
  ],
  template: `
    <div class="page-header">
      <div>
        <h1>Pagos y Renovaciones</h1>
        <p class="text-slate-500">{{ total }} pagos registrados</p>
      </div>
      <button *appHasRole="['ADMIN', 'EDITOR']" mat-raised-button color="primary"
              routerLink="/payments/new" class="add-btn">
        <mat-icon>add</mat-icon> Registrar Pago
      </button>
    </div>

    <!-- Stats ADMIN -->
    <div *appHasRole="['ADMIN']" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="stat-card green">
        <div class="stat-icon"><mat-icon>check_circle</mat-icon></div>
        <div class="stat-body">
          <span class="stat-label">Total Cobrado</span>
          <span class="stat-value">S/ {{ stats.totalPagado | number:'1.2-2' }}</span>
        </div>
      </div>
      <div class="stat-card amber">
        <div class="stat-icon"><mat-icon>pending</mat-icon></div>
        <div class="stat-body">
          <span class="stat-label">Pendiente de Cobro</span>
          <span class="stat-value">S/ {{ stats.totalPendiente | number:'1.2-2' }}</span>
        </div>
      </div>
      <div class="stat-card blue">
        <div class="stat-icon"><mat-icon>receipt_long</mat-icon></div>
        <div class="stat-body">
          <span class="stat-label">Total Pagos</span>
          <span class="stat-value">{{ total }}</span>
        </div>
      </div>
    </div>

    <!-- Filter -->
    <mat-button-toggle-group class="mb-4 filter-toggle" (change)="filterEstado($event.value)">
      <mat-button-toggle value="all" [checked]="true">Todos</mat-button-toggle>
      <mat-button-toggle value="PENDIENTE">Pendientes</mat-button-toggle>
      <mat-button-toggle value="PAGADO">Pagados</mat-button-toggle>
      <mat-button-toggle value="ANULADO">Anulados</mat-button-toggle>
    </mat-button-toggle-group>

    <mat-card class="table-card">
      @if (loading) {
        <app-skeleton type="table" [rowCount]="5" [colCount]="6"></app-skeleton>
      } @else if (dataSource.data.length === 0) {
        <div class="empty-state">
          <mat-icon>receipt_long</mat-icon>
          <h3>Sin pagos</h3>
          <p>Registra el primer pago de una suscripcion</p>
        </div>
      } @else {
        <div class="mobile-cards">
        <table mat-table [dataSource]="dataSource" class="w-full">
          <ng-container matColumnDef="cliente">
            <th mat-header-cell *matHeaderCellDef>Cliente</th>
            <td mat-cell *matCellDef="let p" data-label="Cliente">
              <div class="client-cell">
                <div class="client-avatar">{{ p.subscription?.client?.nombre?.charAt(0) || '?' }}</div>
                <div>
                  <div class="font-medium text-sm">{{ p.subscription?.client?.nombre || '-' }}</div>
                  <div class="text-xs text-slate-400">{{ p.subscription?.dominio || '-' }}</div>
                </div>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="servicio">
            <th mat-header-cell *matHeaderCellDef>Servicio</th>
            <td mat-cell *matCellDef="let p" data-label="Servicio">
              <span class="service-chip">{{ p.subscription?.service?.nombre || '-' }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="monto">
            <th mat-header-cell *matHeaderCellDef>Monto</th>
            <td mat-cell *matCellDef="let p" data-label="Monto">
              <span class="font-semibold">S/ {{ p.monto | number:'1.2-2' }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="metodo">
            <th mat-header-cell *matHeaderCellDef>Metodo</th>
            <td mat-cell *matCellDef="let p" data-label="Metodo">
              <span class="method-badge">{{ getMetodoLabel(p.metodoPago) }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="estado">
            <th mat-header-cell *matHeaderCellDef>Estado</th>
            <td mat-cell *matCellDef="let p" data-label="Estado">
              <span [class]="'pay-badge pay-' + p.estado.toLowerCase()">
                <span class="dot"></span>
                {{ getEstadoLabel(p.estado) }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="fechaVenc">
            <th mat-header-cell *matHeaderCellDef>Vence Pago</th>
            <td mat-cell *matCellDef="let p" data-label="Vence">
              {{ p.fechaVencimientoPago | dateFormat }}
            </td>
          </ng-container>

          <ng-container matColumnDef="renovacion">
            <th mat-header-cell *matHeaderCellDef>Renovado</th>
            <td mat-cell *matCellDef="let p" data-label="Renovado">
              <mat-icon [class]="p.renovacionAplicada ? 'text-green-500' : 'text-slate-300'" style="font-size: 20px;">
                {{ p.renovacionAplicada ? 'autorenew' : 'remove_circle_outline' }}
              </mat-icon>
            </td>
          </ng-container>

          <ng-container matColumnDef="acciones">
            <th mat-header-cell *matHeaderCellDef style="width: 120px;">Acciones</th>
            <td mat-cell *matCellDef="let p">
              <div class="action-buttons">
                @if (p.estado === 'PENDIENTE') {
                  <button *appHasRole="['ADMIN','EDITOR']" mat-icon-button
                          (click)="markAsPaid(p)" matTooltip="Marcar como pagado">
                    <mat-icon class="text-green-500">check_circle</mat-icon>
                  </button>
                }
                <a *appHasRole="['ADMIN','EDITOR']" mat-icon-button
                   [routerLink]="['/payments', p.id, 'edit']" matTooltip="Editar">
                  <mat-icon class="text-amber-500">edit</mat-icon>
                </a>
                <button *appHasRole="['ADMIN']" mat-icon-button
                        (click)="confirmDelete(p)" matTooltip="Eliminar"
                        [disabled]="p.renovacionAplicada">
                  <mat-icon [class]="p.renovacionAplicada ? 'text-slate-300' : 'text-red-500'">delete_outline</mat-icon>
                </button>
              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
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
    .filter-toggle { height: 36px; }

    /* Stats */
    .stat-card {
      display: flex; align-items: center; gap: 16px;
      background: white; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;
    }
    .stat-icon {
      width: 44px; height: 44px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      mat-icon { font-size: 22px; width: 22px; height: 22px; color: white; }
    }
    .green .stat-icon { background: linear-gradient(135deg, #22c55e, #16a34a); }
    .amber .stat-icon { background: linear-gradient(135deg, #f59e0b, #d97706); }
    .blue .stat-icon { background: linear-gradient(135deg, #3b82f6, #2563eb); }
    .stat-body { display: flex; flex-direction: column; }
    .stat-label { font-size: 12px; color: #64748b; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }
    .stat-value { font-size: 22px; font-weight: 700; color: #0f172a; }

    /* Table */
    .table-card { padding: 0 !important; overflow: hidden; }
    .client-cell { display: flex; align-items: center; gap: 10px; }
    .client-avatar {
      width: 32px; height: 32px; border-radius: 8px;
      background: linear-gradient(135deg, #7c3aed, #a78bfa);
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 600; font-size: 13px;
    }
    .service-chip {
      display: inline-block; padding: 3px 8px; border-radius: 4px;
      font-size: 12px; font-weight: 500; background: #f1f5f9; color: #475569;
    }
    .method-badge {
      display: inline-block; padding: 3px 8px; border-radius: 4px;
      font-size: 11px; font-weight: 600; background: #eff6ff; color: #2563eb;
      text-transform: uppercase; letter-spacing: 0.03em;
    }

    /* Payment status badges */
    .pay-badge {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;
    }
    .pay-badge .dot { width: 6px; height: 6px; border-radius: 50%; }
    .pay-pendiente { background: #fffbeb; color: #b45309; .dot { background: #f59e0b; } }
    .pay-pagado { background: #f0fdf4; color: #15803d; .dot { background: #22c55e; } }
    .pay-anulado { background: #f1f5f9; color: #475569; .dot { background: #94a3b8; } }

    .action-buttons { display: flex; }
    .empty-state {
      display: flex; flex-direction: column; align-items: center;
      padding: 48px 24px; color: #94a3b8;
      mat-icon { font-size: 48px; width: 48px; height: 48px; color: #cbd5e1; margin-bottom: 12px; }
      h3 { font-size: 16px; font-weight: 600; color: #475569; margin: 0 0 4px; }
      p { font-size: 14px; margin: 0; }
    }
  `],
})
export class PaymentListComponent implements OnInit {
  columns = ['cliente', 'servicio', 'monto', 'metodo', 'estado', 'fechaVenc', 'renovacion', 'acciones'];
  dataSource = new MatTableDataSource<Payment>([]);
  total = 0;
  page = 1;
  loading = true;
  estadoFilter?: string;
  stats = { totalPagado: 0, totalPendiente: 0 };

  constructor(
    private paymentService: PaymentService,
    public authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load();
    this.loadStats();
  }

  load(): void {
    this.loading = true;
    this.paymentService.getAll(this.page, 10, undefined, this.estadoFilter)
      .pipe(finalize(() => { this.loading = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: (r: any) => {
          this.dataSource.data = r.data?.data || [];
          this.total = r.data?.total || 0;
        },
      });
  }

  loadStats(): void {
    this.paymentService.getStats().subscribe({
      next: (r: any) => {
        this.stats = r.data || { totalPagado: 0, totalPendiente: 0 };
        this.cdr.detectChanges();
      },
    });
  }

  onPage(e: PageEvent): void { this.page = e.pageIndex + 1; this.load(); }

  filterEstado(val: string): void {
    this.estadoFilter = val === 'all' ? undefined : val;
    this.page = 1;
    this.load();
  }

  markAsPaid(p: Payment): void {
    this.paymentService.update(p.id, { estado: 'PAGADO' as any }).subscribe({
      next: () => {
        this.snackBar.open('Pago marcado como PAGADO. Suscripcion renovada automaticamente.', 'OK', { duration: 4000 });
        this.load();
        this.loadStats();
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error al actualizar pago', 'Cerrar', { duration: 3000 });
      },
    });
  }

  confirmDelete(p: Payment): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Eliminar Pago', message: 'Seguro que deseas eliminar este pago de S/' + p.monto + '?' },
    }).afterClosed().subscribe(ok => {
      if (ok) {
        this.paymentService.delete(p.id).subscribe({
          next: () => {
            this.snackBar.open('Pago eliminado', 'Cerrar', { duration: 3000 });
            this.load();
            this.loadStats();
          },
          error: (err) => this.snackBar.open(err.error?.message || 'Error al eliminar', 'Cerrar', { duration: 3000 }),
        });
      }
    });
  }

  getMetodoLabel(m: string): string {
    const labels: Record<string, string> = {
      'TRANSFERENCIA': 'Transf.', 'EFECTIVO': 'Efectivo', 'YAPE': 'Yape',
      'PLIN': 'Plin', 'TARJETA': 'Tarjeta', 'OTRO': 'Otro',
    };
    return labels[m] || m;
  }

  getEstadoLabel(e: string): string {
    const labels: Record<string, string> = {
      'PENDIENTE': 'Pendiente', 'PAGADO': 'Pagado', 'ANULADO': 'Anulado',
    };
    return labels[e] || e;
  }
}
