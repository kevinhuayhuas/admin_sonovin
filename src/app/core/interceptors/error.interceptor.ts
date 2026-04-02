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
      if (error.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.navigate(['/login']);
      } else if (error.status === 403) {
        snackBar.open('No tienes permisos para realizar esta acción', 'Cerrar', {
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
