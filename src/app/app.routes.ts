import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      // Clients
      {
        path: 'clients',
        loadComponent: () =>
          import('./features/clients/client-list/client-list.component').then((m) => m.ClientListComponent),
      },
      {
        path: 'clients/new',
        loadComponent: () =>
          import('./features/clients/client-form/client-form.component').then((m) => m.ClientFormComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'EDITOR'] },
      },
      {
        path: 'clients/:id',
        loadComponent: () =>
          import('./features/clients/client-detail/client-detail.component').then((m) => m.ClientDetailComponent),
      },
      {
        path: 'clients/:id/edit',
        loadComponent: () =>
          import('./features/clients/client-form/client-form.component').then((m) => m.ClientFormComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'EDITOR'] },
      },
      // Services
      {
        path: 'services',
        loadComponent: () =>
          import('./features/services/service-list/service-list.component').then((m) => m.ServiceListComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
      },
      {
        path: 'services/new',
        loadComponent: () =>
          import('./features/services/service-form/service-form.component').then((m) => m.ServiceFormComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
      },
      {
        path: 'services/:id/edit',
        loadComponent: () =>
          import('./features/services/service-form/service-form.component').then((m) => m.ServiceFormComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
      },
      // Subscriptions
      {
        path: 'subscriptions',
        loadComponent: () =>
          import('./features/subscriptions/subscription-list/subscription-list.component').then(
            (m) => m.SubscriptionListComponent,
          ),
      },
      {
        path: 'subscriptions/new',
        loadComponent: () =>
          import('./features/subscriptions/subscription-form/subscription-form.component').then(
            (m) => m.SubscriptionFormComponent,
          ),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'EDITOR'] },
      },
      {
        path: 'subscriptions/:id/edit',
        loadComponent: () =>
          import('./features/subscriptions/subscription-form/subscription-form.component').then(
            (m) => m.SubscriptionFormComponent,
          ),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'EDITOR'] },
      },
      // Notifications
      {
        path: 'notifications',
        loadComponent: () =>
          import('./features/notifications/notification-list/notification-list.component').then(
            (m) => m.NotificationListComponent,
          ),
      },
      // Users (ADMIN only)
      {
        path: 'users',
        loadComponent: () =>
          import('./features/users/user-list/user-list.component').then((m) => m.UserListComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
      },
      {
        path: 'users/new',
        loadComponent: () =>
          import('./features/users/user-form/user-form.component').then((m) => m.UserFormComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
      },
      {
        path: 'users/:id/edit',
        loadComponent: () =>
          import('./features/users/user-form/user-form.component').then((m) => m.UserFormComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
      },
      // WHOIS
      {
        path: 'whois',
        loadComponent: () =>
          import('./features/whois/whois-lookup/whois-lookup.component').then(
            (m) => m.WhoisLookupComponent,
          ),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'EDITOR'] },
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
