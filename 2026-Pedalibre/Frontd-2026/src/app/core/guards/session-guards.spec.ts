import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { SessionStore } from '../services/session-store';
import { authGuard, guestGuard, permissionGuard } from './session-guards';

describe('session guards', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  it('redirects guests to login with an internal returnUrl', () => {
    const result = TestBed.runInInjectionContext(() =>
      authGuard(
        {} as ActivatedRouteSnapshot,
        { url: '/stations?status=active' } as RouterStateSnapshot,
      ),
    );
    expect(result).toBeInstanceOf(UrlTree);
    if (!(result instanceof UrlTree)) throw new Error('Expected login redirect');
    expect(TestBed.inject(Router).serializeUrl(result)).toBe(
      '/login?returnUrl=%2Fstations%3Fstatus%3Dactive',
    );
  });

  it('redirects authenticated guests away from login', () => {
    const store = TestBed.inject(SessionStore);
    store.setTokens({
      access_token: 'access',
      token_type: 'Bearer',
      expires_in: 900,
      refresh_token: 'refresh',
      refresh_expires_in: 3600,
    });
    const result = TestBed.runInInjectionContext(() => guestGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot));
    expect(result).toBeInstanceOf(UrlTree);
    if (!(result instanceof UrlTree)) throw new Error('Expected authenticated route redirect');
    expect(TestBed.inject(Router).serializeUrl(result)).toBe('/dashboard');
  });

  it('redirects authenticated clients to their reservations', () => {
    const store = TestBed.inject(SessionStore);
    store.setTokens({
      access_token: 'access',
      token_type: 'Bearer',
      expires_in: 900,
      refresh_token: 'refresh',
      refresh_expires_in: 3600,
    });
    store.setAccess(
      { id: 1, role_id: 2, username: 'client', email: null, status: 'active' },
      [{
        resource_id: 1,
        method: 'GET',
        path: '/api/reservations',
        description: null,
        role_id: 2,
        role_name: 'CLIENTE',
      }],
    );
    const result = TestBed.runInInjectionContext(() =>
      guestGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
    expect(result).toBeInstanceOf(UrlTree);
    if (!(result instanceof UrlTree)) throw new Error('Expected client route redirect');
    expect(TestBed.inject(Router).serializeUrl(result)).toBe('/reservations');
  });

  it('allows exact effective permissions and blocks missing permissions', () => {
    const store = TestBed.inject(SessionStore);
    store.setTokens({
      access_token: 'access',
      token_type: 'Bearer',
      expires_in: 900,
      refresh_token: 'refresh',
      refresh_expires_in: 3600,
    });
    store.setAccess(
      { id: 1, role_id: 1, username: 'test', email: null, status: 'active' },
      [{
        resource_id: 1,
        method: 'GET',
        path: '/api/stations',
        description: null,
        role_id: 1,
        role_name: 'OPERACIONES',
      }],
    );
    const route = {
      data: { permission: 'GET /api/stations' },
    } as unknown as ActivatedRouteSnapshot;
    const state = { url: '/stations' } as RouterStateSnapshot;
    const result = TestBed.runInInjectionContext(() => permissionGuard(route, state));
    expect(result).toBe(true);

    route.data['permission'] = 'POST /api/stations';
    const denied = TestBed.runInInjectionContext(() => permissionGuard(route, state));
    expect(denied).toBeInstanceOf(UrlTree);
    if (!(denied instanceof UrlTree)) throw new Error('Expected forbidden redirect');
    expect(TestBed.inject(Router).serializeUrl(denied)).toContain('/forbidden');
  });
});
