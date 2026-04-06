import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error) => {
      // Don't redirect on login endpoint 401 - let the login component handle it
      const isLoginRequest = req.url.includes('/auth/login');

      if (error.status === 401 && !isLoginRequest) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.navigate(['/login']);
      } else if (error.status === 403) {
        snackBar.open('No tienes permisos para realizar esta accion', 'Cerrar', {
          duration: 3000,
        });
      } else if (error.status === 0) {
        snackBar.open('Sin conexion al servidor', 'Cerrar', {
          duration: 3000,
        });
      } else if (error.status >= 500) {
        snackBar.open('Error del servidor. Intenta nuevamente.', 'Cerrar', {
          duration: 3000,
        });
      }
      return throwError(() => error);
    }),
  );
};
