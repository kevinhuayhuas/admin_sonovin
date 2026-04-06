import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Table skeleton -->
    @if (type === 'table') {
      <div class="skeleton-table">
        <div class="skeleton-header">
          @for (col of cols; track col) {
            <div class="skeleton-cell header"></div>
          }
        </div>
        @for (row of rows; track row) {
          <div class="skeleton-row" [style.animation-delay]="row * 80 + 'ms'">
            @for (col of cols; track col) {
              <div class="skeleton-cell" [style.width]="getColWidth(col)"></div>
            }
          </div>
        }
      </div>
    }

    <!-- Metric cards skeleton -->
    @if (type === 'metrics') {
      <div class="skeleton-metrics">
        @for (i of [1,2,3,4]; track i) {
          <div class="skeleton-metric" [style.animation-delay]="i * 100 + 'ms'">
            <div class="skeleton-circle"></div>
            <div class="skeleton-metric-text">
              <div class="skeleton-line short"></div>
              <div class="skeleton-line medium"></div>
            </div>
          </div>
        }
      </div>
    }

    <!-- Card skeleton -->
    @if (type === 'card') {
      <div class="skeleton-card">
        <div class="skeleton-line medium"></div>
        <div class="skeleton-line long"></div>
        <div class="skeleton-line short"></div>
      </div>
    }

    <!-- Form skeleton -->
    @if (type === 'form') {
      <div class="skeleton-form">
        @for (i of [1,2,3,4]; track i) {
          <div class="skeleton-field" [style.animation-delay]="i * 80 + 'ms'">
            <div class="skeleton-line short label"></div>
            <div class="skeleton-input"></div>
          </div>
        }
      </div>
    }

    <!-- WHOIS result skeleton -->
    @if (type === 'whois') {
      <div class="skeleton-whois">
        <div class="skeleton-whois-header">
          <div class="skeleton-circle large"></div>
          <div class="skeleton-metric-text">
            <div class="skeleton-line medium"></div>
            <div class="skeleton-line short"></div>
          </div>
        </div>
        <div class="skeleton-whois-grid">
          @for (i of [1,2,3,4]; track i) {
            <div class="skeleton-whois-item" [style.animation-delay]="i * 100 + 'ms'">
              <div class="skeleton-circle small"></div>
              <div class="skeleton-metric-text">
                <div class="skeleton-line short"></div>
                <div class="skeleton-line medium"></div>
              </div>
            </div>
          }
        </div>
        <div class="skeleton-whois-section">
          <div class="skeleton-line short"></div>
          <div class="skeleton-chips">
            <div class="skeleton-chip"></div>
            <div class="skeleton-chip"></div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    /* Base shimmer animation */
    @keyframes shimmer {
      0% { background-position: -400px 0; }
      100% { background-position: 400px 0; }
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .skeleton-line, .skeleton-cell, .skeleton-input, .skeleton-circle, .skeleton-chip {
      background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
      background-size: 800px 100%;
      animation: shimmer 1.5s infinite ease-in-out;
      border-radius: 6px;
    }

    /* Table */
    .skeleton-table { padding: 16px 20px; }
    .skeleton-header, .skeleton-row { display: flex; gap: 16px; padding: 12px 0; }
    .skeleton-header { border-bottom: 1px solid #f1f5f9; }
    .skeleton-row {
      border-bottom: 1px solid #f8fafc;
      animation: fadeInUp 0.3s ease both;
    }
    .skeleton-cell { height: 16px; flex: 1; border-radius: 4px; }
    .skeleton-cell.header { height: 12px; background: #e2e8f0; opacity: 0.6; }

    /* Metrics */
    .skeleton-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
    .skeleton-metric {
      display: flex; align-items: center; gap: 16px;
      background: white; padding: 20px; border-radius: 12px;
      border: 1px solid #e2e8f0;
      animation: fadeInUp 0.3s ease both;
    }
    .skeleton-circle { width: 48px; height: 48px; min-width: 48px; border-radius: 12px; }
    .skeleton-circle.large { width: 48px; height: 48px; border-radius: 12px; }
    .skeleton-circle.small { width: 38px; height: 38px; min-width: 38px; border-radius: 10px; }
    .skeleton-metric-text { display: flex; flex-direction: column; gap: 8px; flex: 1; }

    .skeleton-line { height: 14px; }
    .skeleton-line.short { width: 60%; }
    .skeleton-line.medium { width: 80%; }
    .skeleton-line.long { width: 100%; }
    .skeleton-line.label { height: 10px; width: 30%; margin-bottom: 4px; }

    /* Card */
    .skeleton-card {
      background: white; padding: 24px; border-radius: 12px;
      border: 1px solid #e2e8f0;
      display: flex; flex-direction: column; gap: 12px;
    }

    /* Form */
    .skeleton-form { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .skeleton-field {
      display: flex; flex-direction: column; gap: 6px;
      animation: fadeInUp 0.3s ease both;
    }
    .skeleton-input { height: 48px; border-radius: 8px; }

    /* WHOIS */
    .skeleton-whois {
      background: white; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;
    }
    .skeleton-whois-header {
      display: flex; align-items: center; gap: 16px;
      padding: 24px; border-bottom: 1px solid #f1f5f9;
    }
    .skeleton-whois-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 0;
    }
    .skeleton-whois-item {
      display: flex; align-items: center; gap: 12px;
      padding: 16px 24px; border-bottom: 1px solid #f8fafc;
      animation: fadeInUp 0.3s ease both;
      &:nth-child(odd) { border-right: 1px solid #f8fafc; }
    }
    .skeleton-whois-section { padding: 20px 24px; }
    .skeleton-chips { display: flex; gap: 8px; margin-top: 12px; }
    .skeleton-chip { width: 160px; height: 32px; border-radius: 6px; }

    @media (max-width: 768px) {
      .skeleton-metrics { grid-template-columns: 1fr 1fr; }
      .skeleton-form { grid-template-columns: 1fr; }
      .skeleton-whois-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class SkeletonComponent {
  @Input() type: 'table' | 'metrics' | 'card' | 'form' | 'whois' = 'table';
  @Input() rowCount = 5;
  @Input() colCount = 5;

  get rows() { return Array.from({ length: this.rowCount }, (_, i) => i); }
  get cols() { return Array.from({ length: this.colCount }, (_, i) => i); }

  getColWidth(index: number): string {
    const widths = ['25%', '20%', '15%', '20%', '10%', '10%'];
    return widths[index % widths.length];
  }
}
