import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="'badge badge-' + estado.toLowerCase()">
      <span class="dot"></span>
      {{ label }}
    </span>
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      line-height: 1;
    }
    .dot {
      width: 6px; height: 6px; border-radius: 50%;
    }
    .badge-activo { background: #f0fdf4; color: #15803d; .dot { background: #22c55e; } }
    .badge-por_vencer { background: #fffbeb; color: #b45309; .dot { background: #f59e0b; } }
    .badge-vencido { background: #fef2f2; color: #b91c1c; .dot { background: #ef4444; } }
    .badge-cancelado { background: #f1f5f9; color: #475569; .dot { background: #94a3b8; } }
  `],
})
export class StatusBadgeComponent {
  @Input() estado = '';

  get label(): string {
    const labels: Record<string, string> = {
      'ACTIVO': 'Activo',
      'POR_VENCER': 'Por vencer',
      'VENCIDO': 'Vencido',
      'CANCELADO': 'Cancelado',
    };
    return labels[this.estado] || this.estado;
  }
}
