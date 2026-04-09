import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ClientService } from '../../../core/services/client.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { DaysUntilPipe } from '../../../shared/pipes/days-until.pipe';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { Client } from '../../../core/models/client.model';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatCardModule, MatTableModule,
    MatButtonModule, MatIconModule, StatusBadgeComponent, DaysUntilPipe, DateFormatPipe,
  ],
  template: `
    @if (client) {
      <div class="detail-header">
        <h1>{{ client.nombre }}</h1>
        <a mat-raised-button color="accent" [routerLink]="['/clients', client.id, 'edit']">
          <mat-icon>edit</mat-icon> Editar
        </a>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <mat-card>
          <mat-card-content class="p-4">
            <p><strong>Empresa:</strong> {{ client.empresa || '-' }}</p>
            <p><strong>RUC/DNI:</strong> {{ client.rucDni || '-' }}</p>
            <p><strong>Email:</strong> {{ client.email || '-' }}</p>
            <p><strong>WhatsApp:</strong> {{ client.whatsapp || '-' }}</p>
          </mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-content class="p-4">
            <p><strong>Notas:</strong></p>
            <p class="text-gray-600">{{ client.notas || 'Sin notas' }}</p>
          </mat-card-content>
        </mat-card>
      </div>

      <h2 class="text-xl font-bold mb-4">Suscripciones</h2>
      @if (client.subscriptions && client.subscriptions.length > 0) {
        <div class="table-scroll">
          <table mat-table [dataSource]="client.subscriptions" class="w-full">
            <ng-container matColumnDef="dominio">
              <th mat-header-cell *matHeaderCellDef>Dominio</th>
              <td mat-cell *matCellDef="let s">{{ s.dominio || '-' }}</td>
            </ng-container>
            <ng-container matColumnDef="servicio">
              <th mat-header-cell *matHeaderCellDef>Servicio</th>
              <td mat-cell *matCellDef="let s">{{ s.service?.nombre }}</td>
            </ng-container>
            <ng-container matColumnDef="vencimiento">
              <th mat-header-cell *matHeaderCellDef>Vencimiento</th>
              <td mat-cell *matCellDef="let s">{{ s.fechaVencimiento | dateFormat }} ({{ s.fechaVencimiento | daysUntil }})</td>
            </ng-container>
            <ng-container matColumnDef="estado">
              <th mat-header-cell *matHeaderCellDef>Estado</th>
              <td mat-cell *matCellDef="let s"><app-status-badge [estado]="s.estado"></app-status-badge></td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="subColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: subColumns;"></tr>
          </table>
        </div>
      } @else {
        <p class="text-gray-500">Sin suscripciones</p>
      }
    }
  `,
  styles: [`
    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      h1 { font-size: 26px; font-weight: 700; color: #0f172a; margin: 0; }
    }
    .table-scroll {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }
    @media (max-width: 768px) {
      .detail-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
        h1 { font-size: 22px; }
      }
    }
  `],
})
export class ClientDetailComponent implements OnInit {
  client: Client | null = null;
  subColumns = ['dominio', 'servicio', 'vencimiento', 'estado'];

  constructor(
    private route: ActivatedRoute,
    private clientService: ClientService,
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.params['id'];
    this.clientService.getById(id).subscribe({
      next: (res: any) => (this.client = res.data || res),
    });
  }
}
