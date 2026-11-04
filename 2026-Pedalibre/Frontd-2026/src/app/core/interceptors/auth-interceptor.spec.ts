import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { environment } from '../../../environments/environment';
import { SessionTokens } from '../models/session.model';
import { SessionStore } from '../services/session-store';
import { authInterceptor } from './auth-interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let store: SessionStore;
  const initialTokens: SessionTokens = {
    access_token: 'access-old',
    token_type: 'Bearer',
    expires_in: 900,
    refresh_token: 'refresh-old',
    refresh_expires_in: 3600,
  };

  beforeEach(() => {
    const locks = {
      request: (_name: string, callback: (lock: null) => Promise<unknown>) => callback(null),
    };
    vi.stubGlobal('navigator', { ...navigator, locks });
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
    store = TestBed.inject(SessionStore);
    store.setTokens(initialTokens);
  });

  afterEach(() => {
    backend.verify();
    vi.unstubAllGlobals();
  });

  it('attaches Bearer and shares a single refresh for concurrent 401 responses', async () => {
    const first = firstValueFrom(http.get<{ ok: boolean }>(`${environment.apiUrl}/stations`));
    const second = firstValueFrom(http.get<{ ok: boolean }>(`${environment.apiUrl}/bicycles`));
    const stationRequest = backend.expectOne(`${environment.apiUrl}/stations`);
    const bicycleRequest = backend.expectOne(`${environment.apiUrl}/bicycles`);
    expect(stationRequest.request.headers.get('Authorization')).toBe('Bearer access-old');
    expect(bicycleRequest.request.headers.get('Authorization')).toBe('Bearer access-old');

    stationRequest.flush({ error: 'expired' }, { status: 401, statusText: 'Unauthorized' });
    bicycleRequest.flush({ error: 'expired' }, { status: 401, statusText: 'Unauthorized' });
    const refresh = backend.expectOne(`${environment.apiUrl}/sesion/refresh`);
    expect(refresh.request.headers.has('Authorization')).toBe(false);
    expect(refresh.request.body).toEqual({ refresh_token: 'refresh-old' });
    refresh.flush({ ...initialTokens, access_token: 'access-new', refresh_token: 'refresh-new' });
    await new Promise((resolve) => setTimeout(resolve, 0));

    const retries = backend.match((request) =>
      [ `${environment.apiUrl}/stations`, `${environment.apiUrl}/bicycles` ].includes(request.url),
    );
    expect(retries).toHaveLength(2);
    expect(retries.map((request) => request.request.headers.get('Authorization'))).toEqual([
      'Bearer access-new',
      'Bearer access-new',
    ]);
    retries.forEach((request) => request.flush({ ok: true }));
    await Promise.all([first, second]);
  });
});
