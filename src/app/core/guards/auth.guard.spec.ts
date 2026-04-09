import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [AuthService, provideRouter([]), provideHttpClient()],
    });
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  afterEach(() => localStorage.clear());

  it('deberia redirigir a /login si no hay token', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as any, {} as any),
    );
    expect(result).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('deberia permitir acceso con token valido', () => {
    // JWT con exp en el futuro (año 2099)
    const fakeToken = 'header.' + btoa(JSON.stringify({ sub: 1, email: 'a@b.com', role: 'ADMIN', exp: 9999999999 })) + '.sig';
    localStorage.setItem('token', fakeToken);

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as any, {} as any),
    );
    expect(result).toBe(true);
  });

  it('deberia redirigir con token expirado', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    const fakeToken = 'header.' + btoa(JSON.stringify({ sub: 1, exp: 1000000000 })) + '.sig';
    localStorage.setItem('token', fakeToken);

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as any, {} as any),
    );
    expect(result).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
