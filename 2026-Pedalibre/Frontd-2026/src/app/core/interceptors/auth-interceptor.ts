import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { SessionApi } from '../services/session-api';
import { SessionStore } from '../services/session-store';

const SESSION_RETRY = new HttpContextToken<boolean>(() => false);

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const session = inject(SessionStore);
  const sessionApi = inject(SessionApi);
  const router = inject(Router);
  const isSessionEndpoint = /\/sesion\/(login|refresh|logout)(?:\?|$)/.test(request.url);
  const token = session.accessToken();
  const authenticated = token && !isSessionEndpoint
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;

  return next(authenticated).pipe(
    catchError((error: unknown) => {
      if (
        !(error instanceof HttpErrorResponse) ||
        error.status !== 401 ||
        isSessionEndpoint ||
        !token ||
        request.context.get(SESSION_RETRY)
      ) {
        return throwError(() => error);
      }

      return sessionApi.refresh().pipe(
        catchError((refreshError: unknown) => {
          session.clear();
          void router.navigate(['/login'], {
            queryParams: { returnUrl: router.url },
          });
          return throwError(() => refreshError);
        }),
        switchMap((tokens) =>
          next(
            request.clone({
              setHeaders: {
                Authorization: `Bearer ${tokens.access_token}`,
              },
              context: request.context.set(SESSION_RETRY, true),
            }),
          ).pipe(
            catchError((retryError: unknown) => {
              if (retryError instanceof HttpErrorResponse && retryError.status === 401) {
                session.clear();
                void router.navigate(['/login'], {
                  queryParams: { returnUrl: router.url },
                });
              }
              return throwError(() => retryError);
            }),
          ),
        ),
      );
    }),
  );
};
