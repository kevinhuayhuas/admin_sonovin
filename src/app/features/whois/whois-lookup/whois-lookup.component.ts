import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { WhoisService } from '../../../core/services/whois.service';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-whois-lookup',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, SkeletonComponent,
  ],
  template: `
    <div class="page-header">
      <div>
        <h1>Consulta WHOIS</h1>
        <p class="text-slate-500">Busca informacion de registro de cualquier dominio</p>
      </div>
    </div>

    <mat-card class="search-card">
      <div class="search-row">
        <mat-form-field appearance="outline" class="search-field">
          <mat-icon matPrefix>language</mat-icon>
          <input matInput [(ngModel)]="domain" placeholder="ejemplo.com"
                 (keyup.enter)="lookup()" />
          @if (domain) {
            <button mat-icon-button matSuffix (click)="domain = ''">
              <mat-icon>close</mat-icon>
            </button>
          }
        </mat-form-field>
        <button class="search-btn" (click)="lookup()" [disabled]="!domain || loading">
          @if (loading) {
            <mat-spinner diameter="20"></mat-spinner>
          } @else {
            <mat-icon>search</mat-icon>
          }
          <span>Consultar</span>
        </button>
      </div>
    </mat-card>

    @if (loading) {
      <app-skeleton type="whois"></app-skeleton>
    }

    @if (result && !loading) {
      <mat-card class="result-card">
        @if (result.error) {
          <div class="error-state">
            <mat-icon>error_outline</mat-icon>
            <h3>Error en la consulta</h3>
            <p>{{ result.details || result.error }}</p>
          </div>
        } @else {
          <div class="result-header">
            <div class="domain-badge">
              <mat-icon>language</mat-icon>
            </div>
            <div>
              <h2>{{ result.domain }}</h2>
              <span class="registrar-text">{{ result.registrar || 'Registrar desconocido' }}</span>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <div class="info-icon green"><mat-icon>event</mat-icon></div>
              <div class="info-body">
                <span class="info-label">Fecha de Creacion</span>
                <span class="info-value">{{ formatDate(result.creationDate) }}</span>
              </div>
            </div>

            <div class="info-item">
              <div class="info-icon" [class]="isExpiringSoon(result.expirationDate) ? 'red' : 'blue'">
                <mat-icon>event_busy</mat-icon>
              </div>
              <div class="info-body">
                <span class="info-label">Fecha de Expiracion</span>
                <span class="info-value">{{ formatDate(result.expirationDate) }}</span>
              </div>
            </div>

            <div class="info-item">
              <div class="info-icon amber"><mat-icon>update</mat-icon></div>
              <div class="info-body">
                <span class="info-label">Ultima Actualizacion</span>
                <span class="info-value">{{ formatDate(result.updatedDate) }}</span>
              </div>
            </div>

            <div class="info-item">
              <div class="info-icon purple"><mat-icon>business</mat-icon></div>
              <div class="info-body">
                <span class="info-label">Organizacion</span>
                <span class="info-value">{{ result.registrantOrg || 'No disponible' }}</span>
              </div>
            </div>
          </div>

          @if (result.nameServers) {
            <div class="section">
              <h3><mat-icon>dns</mat-icon> Name Servers</h3>
              <div class="ns-list">
                @for (ns of getNameServers(); track ns) {
                  <span class="ns-chip">{{ ns }}</span>
                }
              </div>
            </div>
          }

          @if (result.status) {
            <div class="section">
              <h3><mat-icon>verified</mat-icon> Estado</h3>
              <div class="status-list">
                @for (s of getStatuses(); track s) {
                  <span class="status-chip">{{ s }}</span>
                }
              </div>
            </div>
          }
        }
      </mat-card>
    }
  `,
  styles: [`
    .page-header {
      margin-bottom: 24px;
      h1 { font-size: 26px; font-weight: 700; color: #0f172a; margin: 0; }
    }

    /* Search */
    .search-card { padding: 16px 20px !important; margin-bottom: 20px; }
    .search-row { display: flex; gap: 12px; align-items: flex-start; }
    .search-field { flex: 1; }
    .search-btn {
      display: flex; align-items: center; gap: 8px;
      height: 52px; padding: 0 24px;
      background: linear-gradient(135deg, #7c3aed, #6d28d9);
      color: white; border: none; border-radius: 12px;
      font-size: 15px; font-weight: 600; cursor: pointer;
      transition: all 0.2s; box-shadow: 0 4px 12px rgba(124,58,237,0.25);
      mat-icon { font-size: 20px; width: 20px; height: 20px; }
      &:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(124,58,237,0.35); transform: translateY(-1px); }
      &:disabled { background: #e2e8f0; color: #94a3b8; box-shadow: none; cursor: not-allowed; }
    }

    /* Result card */
    .result-card { padding: 0 !important; overflow: hidden; }
    .result-header {
      display: flex; align-items: center; gap: 16px;
      padding: 24px; border-bottom: 1px solid #f1f5f9;
    }
    .domain-badge {
      width: 48px; height: 48px; border-radius: 12px;
      background: linear-gradient(135deg, #7c3aed, #6d28d9);
      display: flex; align-items: center; justify-content: center;
      mat-icon { color: white; font-size: 24px; width: 24px; height: 24px; }
    }
    .result-header h2 { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0; }
    .registrar-text { font-size: 14px; color: #64748b; }

    /* Info grid */
    .info-grid {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 0; border-bottom: 1px solid #f1f5f9;
    }
    .info-item {
      display: flex; align-items: center; gap: 12px;
      padding: 16px 24px;
      border-bottom: 1px solid #f8fafc;
      &:nth-child(odd) { border-right: 1px solid #f8fafc; }
    }
    .info-icon {
      width: 38px; height: 38px; min-width: 38px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      mat-icon { font-size: 18px; width: 18px; height: 18px; color: white; }
    }
    .info-icon.green { background: linear-gradient(135deg, #22c55e, #16a34a); }
    .info-icon.blue { background: linear-gradient(135deg, #3b82f6, #2563eb); }
    .info-icon.red { background: linear-gradient(135deg, #ef4444, #dc2626); }
    .info-icon.amber { background: linear-gradient(135deg, #f59e0b, #d97706); }
    .info-icon.purple { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
    .info-body { display: flex; flex-direction: column; }
    .info-label { font-size: 11px; color: #94a3b8; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }
    .info-value { font-size: 14px; color: #0f172a; font-weight: 600; }

    /* Sections */
    .section {
      padding: 20px 24px;
      border-bottom: 1px solid #f1f5f9;
      &:last-child { border-bottom: none; }
      h3 {
        display: flex; align-items: center; gap: 8px;
        font-size: 13px; font-weight: 600; color: #475569;
        text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 12px;
        mat-icon { font-size: 18px; width: 18px; height: 18px; color: #7c3aed; }
      }
    }
    .ns-list, .status-list { display: flex; flex-wrap: wrap; gap: 8px; }
    .ns-chip {
      padding: 6px 12px; border-radius: 6px;
      background: #f1f5f9; color: #334155;
      font-size: 13px; font-weight: 500; font-family: monospace;
    }
    .status-chip {
      padding: 4px 10px; border-radius: 6px;
      background: #f0fdf4; color: #16a34a;
      font-size: 12px; font-weight: 600;
    }

    .error-state {
      display: flex; flex-direction: column; align-items: center;
      padding: 48px 24px; color: #94a3b8;
      mat-icon { font-size: 48px; width: 48px; height: 48px; color: #ef4444; margin-bottom: 12px; }
      h3 { font-size: 16px; font-weight: 600; color: #475569; margin: 0 0 4px; }
      p { font-size: 14px; margin: 0; }
    }

    @media (max-width: 640px) {
      .info-grid { grid-template-columns: 1fr; }
      .info-item:nth-child(odd) { border-right: none; }
    }
  `],
})
export class WhoisLookupComponent {
  domain = '';
  result: any = null;
  loading = false;

  constructor(private whoisService: WhoisService) {}

  lookup(): void {
    if (!this.domain) return;
    // Clean domain input
    let clean = this.domain.trim().toLowerCase();
    clean = clean.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');
    this.domain = clean;

    this.loading = true;
    this.result = null;
    this.whoisService.lookup(clean).subscribe({
      next: (res: any) => { this.result = res.data || res; this.loading = false; },
      error: () => { this.result = { domain: clean, error: 'Error en la consulta' }; this.loading = false; },
    });
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return 'No disponible';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  isExpiringSoon(dateStr: string | null): boolean {
    if (!dateStr) return false;
    const diff = new Date(dateStr).getTime() - Date.now();
    return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000; // 30 days
  }

  getNameServers(): string[] {
    return this.result?.nameServers?.split(',').map((s: string) => s.trim()).filter(Boolean) || [];
  }

  getStatuses(): string[] {
    return this.result?.status?.split(',').map((s: string) => s.trim()).filter(Boolean) || [];
  }
}
