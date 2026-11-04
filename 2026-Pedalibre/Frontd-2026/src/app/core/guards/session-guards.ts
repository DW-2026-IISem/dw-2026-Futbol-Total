import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { SessionStore } from '../services/session-store';

export const authGuard: CanActivateFn = (_route, state) => {
  const session = inject(SessionStore);
  const router = inject(Router);
  if (session.isAuthenticated()) return true;
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: safeReturnUrl(state.url) },
  });
};

export const guestGuard: CanActivateFn = () => {
  const session = inject(SessionStore);
  return session.isAuthenticated()
    ? inject(Router).createUrlTree([defaultAuthenticatedRoute(session)])
    : true;
};

export const permissionGuard: CanActivateFn = (route, state) => {
  const session = inject(SessionStore);
  const router = inject(Router);
  const permission = route.data['permission'];
  if (typeof permission === 'string' && session.canPermission(permission)) return true;
  return router.createUrlTree(['/forbidden'], {
    queryParams: { returnUrl: safeReturnUrl(state.url) },
  });
};

export function safeReturnUrl(value: string | null | undefined): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/login')) {
    return '/';
  }
  return value;
}

export function defaultAuthenticatedRoute(session: SessionStore): string {
  return session.isClientAccount() ? '/reservations' : '/dashboard';
}
