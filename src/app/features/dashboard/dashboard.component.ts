import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService } from '../../core/services/auth.service';
import { SubscriptionService } from '../../core/services/subscription.service';
import { ClientService } from '../../core/services/client.service';
import { HasRoleDirective } from '../../shared/directives/has-role.directive';
import { DaysUntilPipe } from '../../shared/pipes/days-until.pipe';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { finalize, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Subscription } from '../../core/models/subscription.model';
import dayjs from 'dayjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatCardModule, MatIconModule, MatTableModule, MatChipsModule,
    MatButtonModule, MatProgressBarModule,
    HasRoleDirective, DaysUntilPipe, SkeletonComponent,
  ],
  template: `
    <div class="page-header">
      <div>
        <h1>Dashboard</h1>
        <p class="text-slate-500">Resumen general de tu cuenta</p>
      </div>
    </div>

    <!-- Metrics (ADMIN only) -->
    <div *appHasRole="['ADMIN']" class="mb-8">
      @if (loadingMetrics) {
        <app-skeleton type="metrics"></app-skeleton>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-4 gap-5">
      <div class="metric-card blue">
        <div class="metric-icon"><mat-icon>people_alt</mat-icon></div>
        <div class="metric-body">
          <span class="metric-label">Total Clientes</span>
          <span class="metric-value">{{ totalClients }}</span>
        </div>
      </div>
      <div class="metric-card green">
        <div class="metric-icon"><mat-icon>payments</mat-icon></div>
        <div class="metric-body">
          <span class="metric-label">Ingresos Anuales</span>
          <span class="metric-value">S/ {{ totalRevenue | number:'1.2-2' }}</span>
        </div>
      </div>
      <div class="metric-card amber">
        <div class="metric-icon"><mat-icon>schedule</mat-icon></div>
        <div class="metric-body">
          <span class="metric-label">Por Vencer</span>
          <span class="metric-value">{{ expiringCount }}</span>
        </div>
      </div>
      <div class="metric-card red">
        <div class="metric-icon"><mat-icon>error_outline</mat-icon></div>
        <div class="metric-body">
          <span class="metric-label">Vencidos</span>
          <span class="metric-value">{{ expiredCount }}</span>
        </div>
          </div>
        </div>
      }
    </div>

    <!-- Expiration Summary -->
    <mat-card class="table-card">
      <div class="card-header">
        <div>
          <h2>Vencimientos Proximos</h2>
          <p>Dominios y servicios por vencer en los proximos 30 dias</p>
        </div>
        <a mat-stroked-button routerLink="/subscriptions" class="view-all-btn">
          Ver todas <mat-icon>arrow_forward</mat-icon>
        </a>
      </div>

      @if (loadingTable) {
        <app-skeleton type="table" [rowCount]="4" [colCount]="5"></app-skeleton>
      } @else if (expiringSubscriptions.length === 0) {
        <div class="empty-state">
          <mat-icon>check_circle_outline</mat-icon>
          <h3>Todo en orden</h3>
          <p>No hay vencimientos proximos en los siguientes 30 dias</p>
        </div>
      } @else {
        <table mat-table [dataSource]="expiringSubscriptions" class="w-full">
          <ng-container matColumnDef="urgency">
            <th mat-header-cell *matHeaderCellDef style="width: 4px; padding: 0;"></th>
            <td mat-cell *matCellDef="let sub" style="width: 4px; padding: 0;">
              <div [class]="'urgency-bar ' + getUrgencyLevel(sub)"></div>
            </td>
          </ng-container>

          <ng-container matColumnDef="dominio">
            <th mat-header-cell *matHeaderCellDef>Dominio</th>
            <td mat-cell *matCellDef="let sub">
              <div class="domain-cell">
                <mat-icon class="domain-icon">language</mat-icon>
                <span class="font-medium">{{ sub.dominio || 'Sin dominio' }}</span>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="cliente">
            <th mat-header-cell *matHeaderCellDef>Cliente</th>
            <td mat-cell *matCellDef="let sub">{{ sub.client?.nombre }}</td>
          </ng-container>

          <ng-container matColumnDef="servicio">
            <th mat-header-cell *matHeaderCellDef>Servicio</th>
            <td mat-cell *matCellDef="let sub">
              <mat-chip class="service-chip">{{ sub.service?.nombre }}</mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="vencimiento">
            <th mat-header-cell *matHeaderCellDef>Vencimiento</th>
            <td mat-cell *matCellDef="let sub">{{ sub.fechaVencimiento }}</td>
          </ng-container>

          <ng-container matColumnDef="diasRestantes">
            <th mat-header-cell *matHeaderCellDef>Estado</th>
            <td mat-cell *matCellDef="let sub">
              <span [class]="'urgency-badge ' + getUrgencyLevel(sub)">
                {{ sub.fechaVencimiento | daysUntil }}
              </span>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      }
    </mat-card>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 28px;

      h1 { font-size: 26px; font-weight: 700; color: #0f172a; margin: 0; }
    }

    /* Metric Cards */
    .metric-card {
      display: flex;
      align-items: center;
      gap: 16px;
      background: white;
      padding: 20px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      transition: transform 0.15s ease, box-shadow 0.15s ease;

      &:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    }
    .metric-icon {
      width: 48px; height: 48px;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;

      mat-icon { font-size: 24px; width: 24px; height: 24px; color: white; }
    }
    .blue .metric-icon { background: linear-gradient(135deg, #3b82f6, #2563eb); }
    .green .metric-icon { background: linear-gradient(135deg, #22c55e, #16a34a); }
    .amber .metric-icon { background: linear-gradient(135deg, #f59e0b, #d97706); }
    .red .metric-icon { background: linear-gradient(135deg, #ef4444, #dc2626); }
    .metric-body { display: flex; flex-direction: column; }
    .metric-label { font-size: 12px; color: #64748b; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }
    .metric-value { font-size: 24px; font-weight: 700; color: #0f172a; }

    /* Table Card */
    .table-card {
      padding: 0 !important;
      overflow: hidden;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #f1f5f9;

      h2 { font-size: 16px; font-weight: 600; color: #0f172a; margin: 0; }
      p { font-size: 13px; color: #64748b; margin: 2px 0 0; }
    }
    .view-all-btn {
      font-size: 13px;
      color: #7c3aed;
      mat-icon { font-size: 16px; width: 16px; height: 16px; vertical-align: middle; }
    }

    /* Urgency */
    .urgency-bar { width: 4px; height: 100%; min-height: 48px; border-radius: 2px; }
    .urgency-bar.critical { background: #ef4444; }
    .urgency-bar.warning { background: #f59e0b; }
    .urgency-bar.safe { background: #22c55e; }

    .urgency-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
    }
    .urgency-badge.critical { background: #fef2f2; color: #dc2626; }
    .urgency-badge.warning { background: #fffbeb; color: #d97706; }
    .urgency-badge.safe { background: #f0fdf4; color: #16a34a; }

    .domain-cell { display: flex; align-items: center; gap: 8px; }
    .domain-icon { font-size: 18px; width: 18px; height: 18px; color: #94a3b8; }
    .service-chip {
      font-size: 11px !important;
      height: 24px !important;
      --mdc-chip-elevated-container-color: #f1f5f9;
    }

    /* Empty state */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px 24px;
      color: #94a3b8;

      mat-icon { font-size: 48px; width: 48px; height: 48px; color: #22c55e; margin-bottom: 12px; }
      h3 { font-size: 16px; font-weight: 600; color: #475569; margin: 0 0 4px; }
      p { font-size: 14px; margin: 0; }
    }
  `],
})
export class DashboardComponent implements OnInit {
  displayedColumns = ['urgency', 'dominio', 'cliente', 'servicio', 'vencimiento', 'diasRestantes'];
  expiringSubscriptions: Subscription[] = [];
  totalClients = 0;
  totalRevenue = 0;
  expiringCount = 0;
  expiredCount = 0;
  loadingMetrics = true;
  loadingTable = true;

  constructor(
    public authService: AuthService,
    private subscriptionService: SubscriptionService,
    private clientService: ClientService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadExpiring();
    if (this.authService.hasRole('ADMIN')) {
      this.loadMetrics();
    }
  }

  loadExpiring(): void {
    this.subscriptionService.getExpiring(30).pipe(finalize(() => { this.loadingTable = false; this.cdr.detectChanges(); })).subscribe({
      next: (res: any) => {
        this.expiringSubscriptions = res?.data || res || [];
        this.expiringCount = this.expiringSubscriptions.filter(s => this.getDaysLeft(s) > 0).length;
        this.expiredCount = this.expiringSubscriptions.filter(s => this.getDaysLeft(s) <= 0).length;
      },
    });
  }

  loadMetrics(): void {
    forkJoin({
      count: this.clientService.count().pipe(catchError(() => of({ data: 0 }))),
      revenue: this.subscriptionService.getRevenue().pipe(catchError(() => of({ data: 0 }))),
    }).pipe(finalize(() => { this.loadingMetrics = false; this.cdr.detectChanges(); })).subscribe({
      next: ({ count, revenue }: any) => {
        this.totalClients = count?.data ?? 0;
        this.totalRevenue = revenue?.data ?? 0;
      },
    });
  }

  getDaysLeft(sub: Subscription): number {
    return dayjs(sub.fechaVencimiento).diff(dayjs(), 'day');
  }

  getUrgencyLevel(sub: Subscription): string {
    const days = this.getDaysLeft(sub);
    if (days <= 7) return 'critical';
    if (days <= 15) return 'warning';
    return 'safe';
  }
}
