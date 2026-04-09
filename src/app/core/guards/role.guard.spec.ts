import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { roleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';

describe('roleGuard', () => {
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [AuthService, provideRouter([]), provideHttpClient()],
    });
    router = TestBed.inject(Router);
  });

  afterEach(() => localStorage.clear());

  function createRoute(roles: string[]): ActivatedRouteSnapshot {
    return { data: { roles } } as any;
  }

  function setUser(role: string): void {
    localStorage.setItem('user', JSON.stringify({ id: 1, nombre: 'Test', email: 'a@b.com', role, activo: true }));
  }

  it('deberia permitir acceso si no hay roles requeridos', () => {
    setUser('VIEWER');
    const route = { data: {} } as any;
    const result = TestBed.runInInjectionContext(() => roleGuard(route, {} as any));
    expect(result).toBe(true);
  });

  it('deberia permitir ADMIN a rutas de ADMIN', () => {
    setUser('ADMIN');
    const result = TestBed.runInInjectionContext(() =>
      roleGuard(createRoute(['ADMIN']), {} as any),
    );
    expect(result).toBe(true);
  });

  it('deberia bloquear VIEWER de rutas ADMIN', () => {
    setUser('VIEWER');
    const navigateSpy = vi.spyOn(router, 'navigate');
    const result = TestBed.runInInjectionContext(() =>
      roleGuard(createRoute(['ADMIN']), {} as any),
    );
    expect(result).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
  });

  it('deberia permitir EDITOR a rutas ADMIN+EDITOR', () => {
    setUser('EDITOR');
    const result = TestBed.runInInjectionContext(() =>
      roleGuard(createRoute(['ADMIN', 'EDITOR']), {} as any),
    );
    expect(result).toBe(true);
  });
});
