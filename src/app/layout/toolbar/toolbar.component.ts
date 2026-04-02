import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [
    RouterModule, MatToolbarModule, MatIconModule, MatButtonModule,
    MatBadgeModule, MatMenuModule, MatDividerModule, MatTooltipModule,
  ],
  template: `
    <mat-toolbar class="toolbar">
      <button mat-icon-button (click)="toggleSidenav.emit()" class="menu-btn" matTooltip="Colapsar menu">
        <mat-icon>menu</mat-icon>
      </button>
      <span class="spacer"></span>

      <button mat-icon-button matTooltip="Notificaciones" routerLink="/notifications"
              [matBadge]="unreadCount" [matBadgeHidden]="unreadCount === 0"
              matBadgeColor="warn" matBadgeSize="small" class="toolbar-action">
        <mat-icon>notifications_none</mat-icon>
      </button>

      <div class="user-chip" [matMenuTriggerFor]="userMenu">
        <div class="avatar">{{ getInitials() }}</div>
        <div class="user-info">
          <span class="user-name">{{ authService.getCurrentUser()?.nombre }}</span>
          <span class="user-role">{{ authService.getCurrentUser()?.role }}</span>
        </div>
        <mat-icon class="dropdown-icon">expand_more</mat-icon>
      </div>

      <mat-menu #userMenu="matMenu">
        <div class="menu-header">
          <div class="menu-avatar">{{ getInitials() }}</div>
          <div>
            <div class="menu-name">{{ authService.getCurrentUser()?.nombre }}</div>
            <div class="menu-email">{{ authService.getCurrentUser()?.email }}</div>
          </div>
        </div>
        <mat-divider></mat-divider>
        <button mat-menu-item (click)="logout()">
          <mat-icon>logout</mat-icon>
          <span>Cerrar sesion</span>
        </button>
      </mat-menu>
    </mat-toolbar>
  `,
  styles: [`
    .toolbar {
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
      height: 64px;
      padding: 0 20px;
      color: #1e293b;
    }
    .menu-btn { color: #64748b; &:hover { color: #7c3aed; } }
    .spacer { flex: 1 1 auto; }
    .toolbar-action {
      color: #64748b;
      &:hover { color: #7c3aed; }
    }
    .user-chip {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 8px 4px 4px;
      border-radius: 24px;
      cursor: pointer;
      margin-left: 8px;
      transition: background 0.15s;
      &:hover { background: #f1f5f9; }
    }
    .avatar {
      width: 34px; height: 34px;
      background: linear-gradient(135deg, #7c3aed, #a78bfa);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 13px; font-weight: 600;
    }
    .user-info { display: flex; flex-direction: column; line-height: 1.2; }
    .user-name { font-size: 13px; font-weight: 600; color: #1e293b; }
    .user-role {
      font-size: 11px; color: #7c3aed; font-weight: 500;
      text-transform: uppercase; letter-spacing: 0.05em;
    }
    .dropdown-icon { font-size: 18px; width: 18px; height: 18px; color: #94a3b8; }

    .menu-header { display: flex; align-items: center; gap: 12px; padding: 16px; }
    .menu-avatar {
      width: 40px; height: 40px;
      background: linear-gradient(135deg, #7c3aed, #a78bfa);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 14px; font-weight: 600;
    }
    .menu-name { font-size: 14px; font-weight: 600; color: #1e293b; }
    .menu-email { font-size: 12px; color: #64748b; }
  `],
})
export class ToolbarComponent implements OnInit {
  @Output() toggleSidenav = new EventEmitter<void>();
  unreadCount = 0;

  constructor(
    public authService: AuthService,
    private notificationService: NotificationService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadUnreadCount();
  }

  getInitials(): string {
    const name = this.authService.getCurrentUser()?.nombre || '';
    return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  }

  loadUnreadCount(): void {
    this.notificationService.getUnreadCount().subscribe({
      next: (res: any) => (this.unreadCount = res?.data ?? 0),
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
