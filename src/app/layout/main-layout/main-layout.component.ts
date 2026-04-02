import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ToolbarComponent, SidebarComponent],
  template: `
    <div class="layout" [class.collapsed]="collapsed">
      <aside class="sidebar">
        <app-sidebar [collapsed]="collapsed" (toggleCollapse)="collapsed = !collapsed"></app-sidebar>
      </aside>
      <div class="main">
        <app-toolbar (toggleSidenav)="collapsed = !collapsed"></app-toolbar>
        <div class="page-wrapper">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .layout {
      display: flex;
      min-height: 100vh;
    }

    .sidebar {
      width: 260px;
      min-width: 260px;
      transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1),
                  min-width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 100;
    }
    .layout.collapsed .sidebar {
      width: 72px;
      min-width: 72px;
    }

    .main {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .page-wrapper {
      flex: 1;
      padding: 28px 32px;
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
      box-sizing: border-box;
      background: #f1f5f9;
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 768px) {
      .sidebar { position: fixed; left: 0; top: 0; height: 100vh; z-index: 1000; }
      .layout.collapsed .sidebar { width: 0; min-width: 0; overflow: hidden; }
    }
  `],
})
export class MainLayoutComponent {
  collapsed = false;
}
