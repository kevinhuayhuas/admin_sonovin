import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('deberia crearse', () => {
    expect(service).toBeTruthy();
  });

  it('deberia no estar logueado inicialmente', () => {
    expect(service.isLoggedIn()).toBe(false);
    expect(service.getCurrentUser()).toBeNull();
    expect(service.getToken()).toBeNull();
  });

  it('deberia hacer login y guardar token', () => {
    const mockResponse = {
      data: {
        access_token: 'fake-jwt-token.eyJzdWIiOjEsImVtYWlsIjoidGVzdEBtYWlsLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjo5OTk5OTk5OTk5fQ.sig',
        user: { id: 1, nombre: 'Admin', email: 'test@mail.com', role: 'ADMIN' as const, activo: true },
      },
      statusCode: 201,
    };

    service.login('test@mail.com', 'password123').subscribe((res) => {
      expect(res.data.access_token).toBeTruthy();
      expect(res.data.user.role).toBe('ADMIN');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'test@mail.com', password: 'password123' });
    req.flush(mockResponse);

    expect(localStorage.getItem('token')).toBe(mockResponse.data.access_token);
    expect(localStorage.getItem('user')).toBeTruthy();
  });

  it('deberia hacer logout y limpiar storage', () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ id: 1, nombre: 'Test' }));

    service.logout();

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(service.getCurrentUser()).toBeNull();
  });

  it('deberia verificar roles despues de login', () => {
    const mockResponse = {
      data: {
        access_token: 'h.' + btoa(JSON.stringify({ sub: 1, exp: 9999999999 })) + '.s',
        user: { id: 1, nombre: 'Admin', email: 'a@b.com', role: 'ADMIN' as const, activo: true },
      },
      statusCode: 201,
    };

    service.login('a@b.com', '123456').subscribe();
    httpMock.expectOne(`${environment.apiUrl}/auth/login`).flush(mockResponse);

    expect(service.hasRole('ADMIN')).toBe(true);
    expect(service.hasRole('EDITOR')).toBe(false);
    expect(service.hasRole('ADMIN', 'EDITOR')).toBe(true);
  });
});
