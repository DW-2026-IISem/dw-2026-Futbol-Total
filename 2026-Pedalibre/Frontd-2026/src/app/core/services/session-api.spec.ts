import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { environment } from '../../../environments/environment';
import { SessionApi } from './session-api';
import { SessionStore } from './session-store';

describe('SessionApi', () => {
  let api: SessionApi;
  let store: SessionStore;
  let http: HttpTestingController;
  const tokens = {
    access_token: 'access-test',
    token_type: 'Bearer' as const,
    expires_in: 900,
    refresh_token: 'refresh-test',
    refresh_expires_in: 86400,
  };

  beforeEach(() => {
    const locks = {
      request: (_name: string, callback: (lock: null) => Promise<unknown>) => callback(null),
    };
    vi.stubGlobal('navigator', { ...navigator, locks });
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(SessionApi);
    store = TestBed.inject(SessionStore);
    http = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('logs in, then loads profile and effective permissions in parallel', async () => {
    const login = firstValueFrom(api.login('operator', 'test-password'));
    const request = http.expectOne(`${environment.apiUrl}/sesion/login`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ identifier: 'operator', password: 'test-password' });
    request.flush(tokens);

    const profile = http.expectOne(`${environment.apiUrl}/sesion/perfil`);
    const permissions = http.expectOne(`${environment.apiUrl}/permisos`);
    profile.flush({ user: { id: 4, role_id: 2, username: 'operator', email: null, status: 'active' } });
    permissions.flush({
      permissions: [{ resource_id: 3, method: 'GET', path: '/api/stations', description: null, role_id: 2, role_name: 'OPERACIONES' }],
    });

    await login;
    expect(store.isAuthenticated()).toBe(true);
    expect(store.user()?.username).toBe('operator');
    expect(store.canPermission('GET /api/stations')).toBe(true);
  });

  it('registers a client account through the public session endpoint', async () => {
    const payload = {
      username: 'new-client',
      email: 'new-client@example.test',
      password: 'a-secure-password',
      first_name: 'New',
      last_name: 'Client',
      document_type: 'CC',
      document_number: '123456789',
      phone: null,
    };
    const registration = firstValueFrom(api.registerClient(payload));
    const request = http.expectOne(`${environment.apiUrl}/sesion/registro`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({ message: 'Client account created' });
    await expect(registration).resolves.toBeUndefined();
  });

  it('shares an in-flight refresh and stores the rotated pair', async () => {
    store.setTokens(tokens);
    const first = firstValueFrom(api.refresh());
    const second = firstValueFrom(api.refresh());
    const request = http.expectOne(`${environment.apiUrl}/sesion/refresh`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ refresh_token: 'refresh-test' });
    request.flush({ ...tokens, access_token: 'access-rotated', refresh_token: 'refresh-rotated' });
    await Promise.all([first, second]);
    expect(store.accessToken()).toBe('access-rotated');
    expect(store.refreshToken()).toBe('refresh-rotated');
  });

  it('uses the cross-tab rotated token without reusing the consumed refresh token', async () => {
    store.setTokens(tokens);
    const rotated = {
      ...tokens,
      access_token: 'access-from-other-tab',
      refresh_token: 'refresh-from-other-tab',
    };
    localStorage.setItem(
      'pedalibre.session.v1',
      JSON.stringify({ tokens: rotated, user: null, permissions: [] }),
    );
    const result = await firstValueFrom(api.refresh());
    expect(result).toEqual(rotated);
    expect(store.refreshToken()).toBe('refresh-from-other-tab');
    http.expectNone(`${environment.apiUrl}/sesion/refresh`);
  });

  it('clears partial session state when profile loading fails', async () => {
    const login = firstValueFrom(api.login('operator', 'test-password'));
    http.expectOne(`${environment.apiUrl}/sesion/login`).flush(tokens);
    const profile = http.expectOne(`${environment.apiUrl}/sesion/perfil`);
    http.expectOne(`${environment.apiUrl}/permisos`);
    profile.flush(
      { error: 'profile unavailable' },
      { status: 503, statusText: 'Unavailable' },
    );
    await expect(login).rejects.toBeDefined();
    expect(store.isAuthenticated()).toBe(false);
  });

  it('clears local state even if the logout endpoint fails', async () => {
    store.setTokens(tokens);
    const logout = firstValueFrom(api.logout());
    http.expectOne(`${environment.apiUrl}/sesion/logout`).flush(
      { error: 'offline' },
      { status: 503, statusText: 'Unavailable' },
    );
    await expect(logout).rejects.toBeDefined();
    expect(store.isAuthenticated()).toBe(false);
  });
});
