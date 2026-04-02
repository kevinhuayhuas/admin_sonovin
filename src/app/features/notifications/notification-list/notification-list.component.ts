import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from '../../../core/services/notification.service';
import { HasRoleDirective } from '../../../shared/directives/has-role.directive';
import { Notification } from '../../../core/models/notification.model';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, MatTableModule, MatPaginatorModule, MatButtonModule,
    MatIconModule, MatCardModule, MatChipsModule, MatButtonToggleModule,
    MatTooltipModule, HasRoleDirective,
  ],
  template: `
    <div class="page-header">
      <div>
        <h1>Notificaciones</h1>
        <p class="text-slate-500">{{ total }} notificaciones</p>
      </div>
      <mat-button-toggle-group (change)="filter($event.value)" class="filter-toggle">
        <mat-button-toggle value="all" [checked]="true">Todas</mat-button-toggle>
        <mat-button-toggle value="unread">No leidas</mat-button-toggle>
      </mat-button-toggle-group>
    </div>

    <mat-card class="table-card">
      @if (dataSource.data.length === 0 && !loading) {
        <div class="empty-state">
          <mat-icon>notifications_none</mat-icon>
          <h3>Sin notificaciones</h3>
          <p>Las alertas de vencimiento apareceran aqui</p>
        </div>
      } @else {
        <table mat-table [dataSource]="dataSource" class="w-full">
          <ng-container matColumnDef="tipo">
            <th mat-header-cell *matHeaderCellDef>Tipo</th>
            <td mat-cell *matCellDef="let n">
              <span [class]="'tipo-badge tipo-' + getTipoClass(n.tipo)">
                {{ getTipoLabel(n.tipo) }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="dominio">
            <th mat-header-cell *matHeaderCellDef>Dominio</th>
            <td mat-cell *matCellDef="let n">
              <span class="font-medium">{{ n.subscription?.dominio || '-' }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="cliente">
            <th mat-header-cell *matHeaderCellDef>Cliente</th>
            <td mat-cell *matCellDef="let n">{{ n.subscription?.client?.nombre || '-' }}</td>
          </ng-container>

          <ng-container matColumnDef="fecha">
            <th mat-header-cell *matHeaderCellDef>Fecha Envio</th>
            <td mat-cell *matCellDef="let n">
              <span class="text-sm text-slate-600">{{ n.fechaEnvio | date:'dd/MM/yyyy HH:mm' }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="leido">
            <th mat-header-cell *matHeaderCellDef>Leido</th>
            <td mat-cell *matCellDef="let n">
              <mat-icon [class]="n.leido ? 'text-green-500' : 'text-slate-300'" style="font-size: 20px;">
                {{ n.leido ? 'check_circle' : 'radio_button_unchecked' }}
              </mat-icon>
            </td>
          </ng-container>

          <ng-container matColumnDef="clienteNotificado">
            <th mat-header-cell *matHeaderCellDef>Cliente Avisado</th>
            <td mat-cell *matCellDef="let n">
              <mat-icon [class]="n.clienteNotificado ? 'text-green-500' : 'text-slate-300'" style="font-size: 20px;">
                {{ n.clienteNotificado ? 'check_circle' : 'radio_button_unchecked' }}
              </mat-icon>
            </td>
          </ng-container>

          <ng-container matColumnDef="acciones">
            <th mat-header-cell *matHeaderCellDef style="width: 100px;">Acciones</th>
            <td mat-cell *matCellDef="let n">
              <div class="action-buttons">
                <button *appHasRole="['ADMIN','EDITOR']" mat-icon-button
                        (click)="markRead(n)" [disabled]="n.leido" matTooltip="Marcar leida">
                  <mat-icon [class]="n.leido ? 'text-slate-300' : 'text-blue-500'">done</mat-icon>
                </button>
                <button *appHasRole="['ADMIN','EDITOR']" mat-icon-button
                        (click)="markNotified(n)" [disabled]="n.clienteNotificado" matTooltip="Marcar cliente notificado">
                  <mat-icon [class]="n.clienteNotificado ? 'text-slate-300' : 'text-violet-500'">send</mat-icon>
                </button>
              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;" [class.unread-row]="!row.leido"></tr>
        </table>
      }

      <mat-paginator [length]="total" [pageSize]="20" [pageSizeOptions]="[10, 20, 50]"
                     (page)="onPage($event)" showFirstLastButtons></mat-paginator>
    </mat-card>
  `,
  styles: [`
    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;
      h1 { font-size: 26px; font-weight: 700; color: #0f172a; margin: 0; }
    }
    .filter-toggle { height: 36px; }
    .table-card { padding: 0 !important; overflow: hidden; }
    .tipo-badge {
      display: inline-block; padding: 4px 10px; border-radius: 6px;
      font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em;
    }
    .tipo-30 { background: #f0fdf4; color: #16a34a; }
    .tipo-15 { background: #fffbeb; color: #d97706; }
    .tipo-7 { background: #fef2f2; color: #dc2626; }
    .tipo-vencido { background: #1e293b; color: #f1f5f9; }
    .unread-row { background: #faf5ff !important; }
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
export class NotificationListComponent implements OnInit {
  columns = ['tipo', 'dominio', 'cliente', 'fecha', 'leido', 'clienteNotificado', 'acciones'];
  dataSource = new MatTableDataSource<Notification>([]);
  total = 0;
  page = 1;
  loading = true;
  leidoFilter?: boolean;

  constructor(private notifService: NotificationService, private snackBar: MatSnackBar, private cdr: ChangeDetectorRef) {}
  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.notifService.getAll(this.page, 20, this.leidoFilter).subscribe({
      next: (r: any) => {
        this.dataSource.data = r.data?.data || [];
        this.total = r.data?.total || 0;
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  onPage(e: PageEvent): void { this.page = e.pageIndex + 1; this.load(); }

  filter(val: string): void {
    this.leidoFilter = val === 'unread' ? false : undefined;
    this.page = 1;
    this.load();
  }

  getTipoLabel(tipo: string): string {
    const labels: Record<string, string> = {
      '30_DIAS': '30 dias', '15_DIAS': '15 dias', '7_DIAS': '7 dias', 'VENCIDO': 'Vencido',
    };
    return labels[tipo] || tipo;
  }

  getTipoClass(tipo: string): string {
    const classes: Record<string, string> = {
      '30_DIAS': '30', '15_DIAS': '15', '7_DIAS': '7', 'VENCIDO': 'vencido',
    };
    return classes[tipo] || '30';
  }

  markRead(n: Notification): void {
    this.notifService.markAsRead(n.id).subscribe({
      next: () => { n.leido = true; this.cdr.markForCheck(); this.snackBar.open('Marcada como leida', 'OK', { duration: 2000 }); },
    });
  }

  markNotified(n: Notification): void {
    this.notifService.markClientNotified(n.id).subscribe({
      next: () => { n.clienteNotificado = true; this.cdr.markForCheck(); this.snackBar.open('Cliente marcado como notificado', 'OK', { duration: 2000 }); },
    });
  }
}
