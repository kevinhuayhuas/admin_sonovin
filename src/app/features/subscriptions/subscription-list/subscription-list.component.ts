import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { AuthService } from '../../../core/services/auth.service';
import { HasRoleDirective } from '../../../shared/directives/has-role.directive';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { DaysUntilPipe } from '../../../shared/pipes/days-until.pipe';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Subscription } from '../../../core/models/subscription.model';
import dayjs from 'dayjs';

@Component({
  selector: 'app-subscription-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatTableModule, MatPaginatorModule,
    MatButtonModule, MatIconModule, MatCardModule, MatTooltipModule,
    HasRoleDirective, StatusBadgeComponent, DaysUntilPipe,
  ],
  template: `
    <div class="page-header">
      <div>
        <h1>Suscripciones</h1>
        <p class="text-slate-500">{{ total }} suscripciones registradas</p>
      </div>
      <button *appHasRole="['ADMIN', 'EDITOR']" mat-raised-button color="primary"
              routerLink="/subscriptions/new" class="add-btn">
        <mat-icon>add</mat-icon> Nueva Suscripcion
      </button>
    </div>

    <mat-card class="table-card">
      @if (dataSource.data.length === 0 && !loading) {
        <div class="empty-state">
          <mat-icon>card_membership</mat-icon>
          <h3>Sin suscripciones</h3>
          <p>Crea la primera suscripcion para un cliente</p>
        </div>
      } @else {
        <table mat-table [dataSource]="dataSource" class="w-full">
          <ng-container matColumnDef="urgency">
            <th mat-header-cell *matHeaderCellDef style="width: 4px; padding: 0;"></th>
            <td mat-cell *matCellDef="let s" style="width: 4px; padding: 0;">
              <div [class]="'urgency-bar ' + getUrgency(s)"></div>
            </td>
          </ng-container>

          <ng-container matColumnDef="cliente">
            <th mat-header-cell *matHeaderCellDef>Cliente</th>
            <td mat-cell *matCellDef="let s">
              <div class="client-cell">
                <div class="client-avatar">{{ s.client?.nombre?.charAt(0) || '?' }}</div>
                <span class="font-medium">{{ s.client?.nombre || '-' }}</span>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="dominio">
            <th mat-header-cell *matHeaderCellDef>Dominio</th>
            <td mat-cell *matCellDef="let s">
              <div class="domain-cell">
                <mat-icon class="text-slate-400" style="font-size: 16px; width: 16px; height: 16px;">language</mat-icon>
                <span>{{ s.dominio || '-' }}</span>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="servicio">
            <th mat-header-cell *matHeaderCellDef>Servicio</th>
            <td mat-cell *matCellDef="let s">
              <span class="service-chip">{{ s.service?.nombre || '-' }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="vencimiento">
            <th mat-header-cell *matHeaderCellDef>Vencimiento</th>
            <td mat-cell *matCellDef="let s">
              <div>
                <div class="text-sm">{{ s.fechaVencimiento }}</div>
                <span [class]="'urgency-badge ' + getUrgency(s)">
                  {{ s.fechaVencimiento | daysUntil }}
                </span>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="estado">
            <th mat-header-cell *matHeaderCellDef>Estado</th>
            <td mat-cell *matCellDef="let s"><app-status-badge [estado]="s.estado"></app-status-badge></td>
          </ng-container>

          <ng-container matColumnDef="costo">
            <th mat-header-cell *matHeaderCellDef>Costo Anual</th>
            <td mat-cell *matCellDef="let s">
              <span class="font-semibold">S/ {{ s.costoAnual | number:'1.2-2' }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="acciones">
            <th mat-header-cell *matHeaderCellDef style="width: 100px;">Acciones</th>
            <td mat-cell *matCellDef="let s">
              <div class="action-buttons">
                <a *appHasRole="['ADMIN','EDITOR']" mat-icon-button
                   [routerLink]="['/subscriptions', s.id, 'edit']" matTooltip="Editar">
                  <mat-icon class="text-amber-500">edit</mat-icon>
                </a>
                <button *appHasRole="['ADMIN']" mat-icon-button (click)="confirmDelete(s)" matTooltip="Eliminar">
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
    .client-cell { display: flex; align-items: center; gap: 10px; }
    .client-avatar {
      width: 32px; height: 32px; border-radius: 8px;
      background: linear-gradient(135deg, #7c3aed, #a78bfa);
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 600; font-size: 13px;
    }
    .domain-cell { display: flex; align-items: center; gap: 6px; }
    .service-chip {
      display: inline-block; padding: 3px 8px; border-radius: 4px;
      font-size: 12px; font-weight: 500; background: #f1f5f9; color: #475569;
    }
    .urgency-bar { width: 4px; height: 100%; min-height: 48px; border-radius: 2px; }
    .urgency-bar.critical { background: #ef4444; }
    .urgency-bar.warning { background: #f59e0b; }
    .urgency-bar.safe { background: #22c55e; }
    .urgency-bar.neutral { background: #94a3b8; }
    .urgency-badge {
      display: inline-block; padding: 2px 8px; border-radius: 4px;
      font-size: 11px; font-weight: 600; margin-top: 2px;
    }
    .urgency-badge.critical { background: #fef2f2; color: #dc2626; }
    .urgency-badge.warning { background: #fffbeb; color: #d97706; }
    .urgency-badge.safe { background: #f0fdf4; color: #16a34a; }
    .urgency-badge.neutral { background: #f1f5f9; color: #64748b; }
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
export class SubscriptionListComponent implements OnInit {
  columns = ['urgency', 'cliente', 'dominio', 'servicio', 'vencimiento', 'estado', 'costo', 'acciones'];
  dataSource = new MatTableDataSource<Subscription>([]);
  total = 0;
  page = 1;
  loading = true;

  constructor(
    private subService: SubscriptionService,
    public authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.subService.getAll(this.page).subscribe({
      next: (r: any) => {
        this.dataSource.data = r.data?.data || [];
        this.total = r.data?.total || 0;
        this.loading = false;
      },
    });
  }

  onPage(e: PageEvent): void { this.page = e.pageIndex + 1; this.load(); }

  getUrgency(s: Subscription): string {
    if (s.estado === 'CANCELADO') return 'neutral';
    const days = dayjs(s.fechaVencimiento).diff(dayjs(), 'day');
    if (days <= 7) return 'critical';
    if (days <= 15) return 'warning';
    return 'safe';
  }

  confirmDelete(s: Subscription): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Eliminar Suscripcion', message: 'Seguro que deseas eliminar esta suscripcion?' },
    }).afterClosed().subscribe(ok => {
      if (ok) {
        this.subService.delete(s.id).subscribe({
          next: () => {
            this.snackBar.open('Suscripcion eliminada', 'Cerrar', { duration: 3000 });
            this.load();
          },
        });
      }
    });
  }
}
