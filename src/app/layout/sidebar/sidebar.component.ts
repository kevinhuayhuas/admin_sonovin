import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/services/auth.service';
import { HasRoleDirective } from '../../shared/directives/has-role.directive';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatTooltipModule, MatButtonModule, HasRoleDirective],
  template: `
    <div class="sidebar-wrapper" [class.collapsed]="collapsed">
      <!-- Header -->
      <div class="sidebar-header">
        <div class="logo-area">
          <div class="logo-icon">
            <mat-icon>hub</mat-icon>
          </div>
          <div class="logo-text" *ngIf="!collapsed">
            <span class="logo-name">Clientes<strong>SaaS</strong></span>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="nav-body">
        <div class="nav-section">
          <div class="nav-label" *ngIf="!collapsed">PRINCIPAL</div>
          <div class="nav-label separator" *ngIf="collapsed"></div>

          <a class="nav-item" routerLink="/dashboard" routerLinkActive="active"
             [matTooltip]="collapsed ? 'Dashboard' : ''" matTooltipPosition="right">
            <mat-icon>space_dashboard</mat-icon>
            <span class="nav-text" *ngIf="!collapsed">Dashboard</span>
          </a>
          <a class="nav-item" routerLink="/clients" routerLinkActive="active"
             [matTooltip]="collapsed ? 'Clientes' : ''" matTooltipPosition="right">
            <mat-icon>people_alt</mat-icon>
            <span class="nav-text" *ngIf="!collapsed">Clientes</span>
          </a>
          <a class="nav-item" routerLink="/subscriptions" routerLinkActive="active"
             [matTooltip]="collapsed ? 'Suscripciones' : ''" matTooltipPosition="right">
            <mat-icon>card_membership</mat-icon>
            <span class="nav-text" *ngIf="!collapsed">Suscripciones</span>
          </a>
          <a class="nav-item" routerLink="/payments" routerLinkActive="active"
             [matTooltip]="collapsed ? 'Pagos' : ''" matTooltipPosition="right">
            <mat-icon>payments</mat-icon>
            <span class="nav-text" *ngIf="!collapsed">Pagos</span>
          </a>
        </div>

        <div class="nav-section">
          <div class="nav-label" *ngIf="!collapsed">GESTION</div>
          <div class="nav-label separator" *ngIf="collapsed"></div>

          <div *appHasRole="['ADMIN']">
            <a class="nav-item" routerLink="/services" routerLinkActive="active"
               [matTooltip]="collapsed ? 'Servicios' : ''" matTooltipPosition="right">
              <mat-icon>inventory_2</mat-icon>
              <span class="nav-text" *ngIf="!collapsed">Servicios</span>
            </a>
          </div>
          <a class="nav-item" routerLink="/notifications" routerLinkActive="active"
             [matTooltip]="collapsed ? 'Notificaciones' : ''" matTooltipPosition="right">
            <mat-icon>notifications_active</mat-icon>
            <span class="nav-text" *ngIf="!collapsed">Notificaciones</span>
          </a>
          <div *appHasRole="['ADMIN', 'EDITOR']">
            <a class="nav-item" routerLink="/whois" routerLinkActive="active"
               [matTooltip]="collapsed ? 'WHOIS' : ''" matTooltipPosition="right">
              <mat-icon>travel_explore</mat-icon>
              <span class="nav-text" *ngIf="!collapsed">WHOIS</span>
            </a>
          </div>
        </div>

        <div *appHasRole="['ADMIN']" class="nav-section">
          <div class="nav-label" *ngIf="!collapsed">ADMIN</div>
          <div class="nav-label separator" *ngIf="collapsed"></div>

          <a class="nav-item" routerLink="/users" routerLinkActive="active"
             [matTooltip]="collapsed ? 'Usuarios' : ''" matTooltipPosition="right">
            <mat-icon>manage_accounts</mat-icon>
            <span class="nav-text" *ngIf="!collapsed">Usuarios</span>
          </a>
        </div>
      </nav>

      <!-- Footer: collapse toggle -->
      <div class="sidebar-footer">
        <button class="collapse-btn" (click)="toggleCollapse.emit()"
                [matTooltip]="collapsed ? 'Expandir menu' : ''" matTooltipPosition="right">
          <mat-icon>{{ collapsed ? 'chevron_right' : 'chevron_left' }}</mat-icon>
          <span class="nav-text" *ngIf="!collapsed">Colapsar</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .sidebar-wrapper {
      background: #0f172a;
      height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: sticky;
      top: 0;
    }

    /* ===== HEADER ===== */
    .sidebar-header {
      padding: 18px 16px 12px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .logo-area {
      display: flex;
      align-items: center;
      gap: 10px;
      overflow: hidden;
    }
    .logo-icon {
      width: 38px; height: 38px; min-width: 38px;
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 12px rgba(124,58,237,0.3);
      mat-icon { font-size: 20px; width: 20px; height: 20px; color: white; }
    }
    .logo-text { white-space: nowrap; overflow: hidden; }
    .logo-name {
      font-size: 17px; color: #e2e8f0; font-weight: 400;
      strong { color: #a78bfa; font-weight: 700; }
    }

    /* ===== NAV BODY ===== */
    .nav-body {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 8px 0;

      &::-webkit-scrollbar { width: 0; }
    }
    .nav-section {
      margin-bottom: 4px;
    }
    .nav-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.12em;
      color: #475569;
      padding: 14px 20px 6px;
      white-space: nowrap;
      overflow: hidden;
    }
    .nav-label.separator {
      padding: 8px 0;
      margin: 0 14px;
      border-top: 1px solid rgba(255,255,255,0.06);
    }

    /* Collapsed: center label padding */
    .collapsed .nav-label { padding-left: 0; padding-right: 0; text-align: center; }

    /* ===== NAV ITEMS ===== */
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 16px;
      height: 42px;
      color: #94a3b8;
      text-decoration: none;
      font-size: 14px;
      font-weight: 400;
      transition: all 0.15s ease;
      border-left: 3px solid transparent;
      cursor: pointer;
      white-space: nowrap;
      overflow: hidden;

      mat-icon {
        font-size: 20px; width: 20px; height: 20px; min-width: 20px;
        color: #64748b;
        transition: color 0.15s ease;
      }
      .nav-text {
        opacity: 1;
        transition: opacity 0.15s ease;
      }

      &:hover {
        background: rgba(255,255,255,0.04);
        color: #e2e8f0;
        mat-icon { color: #a78bfa; }
      }
      &.active {
        background: rgba(124,58,237,0.12);
        color: #a78bfa;
        border-left-color: #7c3aed;
        font-weight: 500;
        mat-icon { color: #a78bfa; }
      }
    }

    /* Collapsed nav items */
    .collapsed .nav-item {
      justify-content: center;
      padding: 0;
      border-left: none;
      border-radius: 8px;
      margin: 2px 12px;
      height: 42px;

      &.active {
        background: rgba(124,58,237,0.15);
        border-left: none;
      }
    }

    /* ===== FOOTER ===== */
    .sidebar-footer {
      border-top: 1px solid rgba(255,255,255,0.06);
      padding: 12px;
    }
    .collapse-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 8px 10px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 8px;
      color: #64748b;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.15s ease;
      white-space: nowrap;
      overflow: hidden;

      mat-icon { font-size: 18px; width: 18px; height: 18px; min-width: 18px; }

      &:hover {
        background: rgba(255,255,255,0.08);
        color: #a78bfa;
      }
    }
    .collapsed .collapse-btn {
      justify-content: center;
      padding: 8px;
    }
  `],
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() toggleCollapse = new EventEmitter<void>();

  constructor(public authService: AuthService) {}
}
