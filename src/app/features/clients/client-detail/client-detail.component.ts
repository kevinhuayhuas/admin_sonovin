import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { finalize } from 'rxjs';
import { ClientService } from '../../../core/services/client.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { DaysUntilPipe } from '../../../shared/pipes/days-until.pipe';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { HasRoleDirective } from '../../../shared/directives/has-role.directive';
import { Client } from '../../../core/models/client.model';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatCardModule, MatTableModule,
    MatButtonModule, MatIconModule, MatDividerModule,
    StatusBadgeComponent, DaysUntilPipe, DateFormatPipe, SkeletonComponent, HasRoleDirective,
  ],
  template: `
    @if (loading) {
      <div class="mb-6">
        <app-skeleton type="card"></app-skeleton>
      </div>
      <app-skeleton type="table" [rowCount]="3" [colCount]="4"></app-skeleton>
    } @else if (client) {
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <button mat-icon-button routerLink="/clients" class="back-btn">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div class="header-avatar">{{ client.nombre?.charAt(0) }}</div>
          <div>
            <h1>{{ client.nombre }}</h1>
            <p class="text-slate-500">{{ client.empresa || 'Sin empresa' }}</p>
          </div>
        </div>
        <div class="header-actions">
          <a *appHasRole="['ADMIN','EDITOR']" mat-raised-button color="primary"
             [routerLink]="['/clients', client.id, 'edit']" class="edit-btn">
            <mat-icon>edit</mat-icon> Editar
          </a>
        </div>
      </div>

      <!-- Info Cards -->
      <div class="info-grid">
        <mat-card class="info-card">
          <div class="info-card-header">
            <mat-icon>badge</mat-icon>
            <span>Informacion General</span>
          </div>
          <mat-divider></mat-divider>
          <div class="info-rows">
            <div class="info-row">
              <span class="info-label"><mat-icon>business</mat-icon> Empresa</span>
              <span class="info-value">{{ client.empresa || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label"><mat-icon>badge</mat-icon> RUC/DNI</span>
              <span class="info-value">{{ client.rucDni || '-' }}</span>
            </div>
          </div>
        </mat-card>

        <mat-card class="info-card">
          <div class="info-card-header">
            <mat-icon>contact_phone</mat-icon>
            <span>Contacto</span>
          </div>
          <mat-divider></mat-divider>
          <div class="info-rows">
            <div class="info-row">
              <span class="info-label"><mat-icon>email</mat-icon> Email</span>
              <span class="info-value">{{ client.email || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label"><mat-icon>phone</mat-icon> WhatsApp</span>
              <span class="info-value">{{ client.whatsapp || '-' }}</span>
            </div>
          </div>
        </mat-card>

        @if (client.notas) {
          <mat-card class="info-card notes-card">
            <div class="info-card-header">
              <mat-icon>notes</mat-icon>
              <span>Notas</span>
            </div>
            <mat-divider></mat-divider>
            <div class="notes-content">{{ client.notas }}</div>
          </mat-card>
        }
      </div>

      <!-- Subscriptions -->
      <mat-card class="subs-card">
        <div class="subs-header">
          <div>
            <h2>Suscripciones</h2>
            <p>{{ client.subscriptions?.length || 0 }} servicios activos</p>
          </div>
          <a *appHasRole="['ADMIN','EDITOR']" mat-stroked-button
             [routerLink]="['/subscriptions/new']"
             [queryParams]="{ clientId: client.id }" class="new-sub-btn">
            <mat-icon>add</mat-icon> Nueva
          </a>
        </div>

        @if (client.subscriptions && client.subscriptions.length > 0) {
          <div class="mobile-cards">
          <table mat-table [dataSource]="client.subscriptions" class="w-full">
            <ng-container matColumnDef="dominio">
              <th mat-header-cell *matHeaderCellDef>Dominio</th>
              <td mat-cell *matCellDef="let s" data-label="Dominio">
                <div class="domain-cell">
                  <mat-icon class="text-slate-400" style="font-size:16px;width:16px;height:16px;">language</mat-icon>
                  <span class="font-medium">{{ s.dominio || '-' }}</span>
                </div>
              </td>
            </ng-container>
            <ng-container matColumnDef="servicio">
              <th mat-header-cell *matHeaderCellDef>Servicio</th>
              <td mat-cell *matCellDef="let s" data-label="Servicio">
                <span class="service-chip">{{ s.service?.nombre }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="vencimiento">
              <th mat-header-cell *matHeaderCellDef>Vencimiento</th>
              <td mat-cell *matCellDef="let s" data-label="Vence">
                <div>
                  <div class="text-sm">{{ s.fechaVencimiento | dateFormat }}</div>
                  <span class="days-badge">{{ s.fechaVencimiento | daysUntil }}</span>
                </div>
              </td>
            </ng-container>
            <ng-container matColumnDef="costo">
              <th mat-header-cell *matHeaderCellDef>Costo</th>
              <td mat-cell *matCellDef="let s" data-label="Costo">
                <span class="font-semibold">S/ {{ s.costoAnual | number:'1.2-2' }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="estado">
              <th mat-header-cell *matHeaderCellDef>Estado</th>
              <td mat-cell *matCellDef="let s" data-label="Estado">
                <app-status-badge [estado]="s.estado"></app-status-badge>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="subColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: subColumns;"></tr>
          </table>
          </div>
        } @else {
          <div class="empty-subs">
            <mat-icon>card_membership</mat-icon>
            <p>Este cliente no tiene suscripciones</p>
          </div>
        }
      </mat-card>
    }
  `,
  styles: [`
    /* Header */
    .page-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 24px; gap: 16px;
    }
    .header-left { display: flex; align-items: center; gap: 14px; }
    .back-btn { color: var(--c-text-3, #64748b); }
    .header-avatar {
      width: 48px; height: 48px; border-radius: 12px;
      background: var(--g-primary, linear-gradient(135deg, #7c3aed, #6d28d9));
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 20px; font-weight: 700;
    }
    .page-header h1 { font-size: 24px; font-weight: 700; color: #0f172a; margin: 0; }
    .edit-btn { border-radius: 10px !important; }

    /* Info Grid */
    .info-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
      margin-bottom: 24px;
    }
    .info-card { padding: 0 !important; overflow: hidden; }
    .info-card-header {
      display: flex; align-items: center; gap: 8px;
      padding: 14px 20px; font-size: 14px; font-weight: 600; color: #475569;
      mat-icon { font-size: 18px; width: 18px; height: 18px; color: var(--c-primary, #7c3aed); }
    }
    .info-rows { padding: 4px 0; }
    .info-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 10px 20px;
      &:not(:last-child) { border-bottom: 1px solid #f8fafc; }
    }
    .info-label {
      display: flex; align-items: center; gap: 6px;
      font-size: 13px; color: #94a3b8;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }
    .info-value { font-size: 14px; font-weight: 500; color: #0f172a; }
    .notes-card { grid-column: span 2; }
    .notes-content {
      padding: 14px 20px; font-size: 14px; color: #475569;
      line-height: 1.6; white-space: pre-wrap;
    }

    /* Subscriptions */
    .subs-card { padding: 0 !important; overflow: hidden; }
    .subs-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 18px 20px; border-bottom: 1px solid #f1f5f9;
      h2 { font-size: 16px; font-weight: 600; color: #0f172a; margin: 0; }
      p { font-size: 13px; color: #94a3b8; margin: 2px 0 0; }
    }
    .new-sub-btn { border-radius: 8px !important; font-size: 13px; color: var(--c-primary, #7c3aed); }
    .domain-cell { display: flex; align-items: center; gap: 6px; }
    .service-chip {
      display: inline-block; padding: 3px 8px; border-radius: 4px;
      font-size: 12px; font-weight: 500; background: #f1f5f9; color: #475569;
    }
    .days-badge {
      display: inline-block; padding: 2px 8px; border-radius: 4px;
      font-size: 11px; font-weight: 600; margin-top: 2px;
      background: #f0fdf4; color: #16a34a;
    }
    .empty-subs {
      display: flex; flex-direction: column; align-items: center;
      padding: 40px 20px; color: #94a3b8;
      mat-icon { font-size: 40px; width: 40px; height: 40px; color: #cbd5e1; margin-bottom: 8px; }
      p { font-size: 14px; margin: 0; }
    }

    @media (max-width: 768px) {
      .page-header { flex-direction: column; align-items: flex-start; }
      .info-grid { grid-template-columns: 1fr; }
      .notes-card { grid-column: span 1; }
      .header-avatar { width: 40px; height: 40px; font-size: 16px; }
      .page-header h1 { font-size: 20px; }
      .subs-header { padding: 14px 16px; }
    }
  `],
})
export class ClientDetailComponent implements OnInit {
  client: Client | null = null;
  loading = true;
  subColumns = ['dominio', 'servicio', 'vencimiento', 'costo', 'estado'];

  constructor(
    private route: ActivatedRoute,
    private clientService: ClientService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.params['id'];
    this.clientService.getById(id)
      .pipe(finalize(() => { this.loading = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: (res: any) => (this.client = res.data || res),
      });
  }
}
