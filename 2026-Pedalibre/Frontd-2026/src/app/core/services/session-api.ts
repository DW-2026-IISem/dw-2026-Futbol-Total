import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  Observable,
  catchError,
  finalize,
  firstValueFrom,
  forkJoin,
  from,
  map,
  of,
  shareReplay,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  EffectivePermission,
  ClientRegistrationPayload,
  SessionTokens,
  SessionUser,
} from '../models/session.model';
import { SessionStore } from './session-store';

@Injectable({ providedIn: 'root' })
export class SessionApi {
  private readonly http = inject(HttpClient);
  private readonly store = inject(SessionStore);
  private readonly base = `${environment.apiUrl}/sesion`;
  private refreshRequest: Observable<SessionTokens> | null = null;

  login(identifier: string, password: string): Observable<void> {
    return this.http
      .post<SessionTokens>(`${this.base}/login`, { identifier, password })
      .pipe(
        tap((tokens) => this.store.setTokens(tokens)),
        switchMap(() => this.loadAccess()),
        catchError((error: unknown) => {
          this.store.clear();
          return throwError(() => error);
        }),
      );
  }

  registerClient(payload: ClientRegistrationPayload): Observable<void> {
    return this.http
      .post<{ message: string }>(`${this.base}/registro`, payload)
      .pipe(map(() => undefined));
  }

  refresh(): Observable<SessionTokens> {
    if (this.refreshRequest) return this.refreshRequest;
    const refresh_token = this.store.refreshToken();
    if (!refresh_token) return throwError(() => new Error('No refresh token is available'));
    const locks = typeof navigator === 'undefined' ? undefined : navigator.locks;
    if (!locks) {
      this.store.clear();
      return throwError(() => new Error('This browser cannot safely coordinate refresh-token rotation across tabs'));
    }
    this.refreshRequest = from(
      locks.request('pedalibre-session-refresh', async () => {
        this.store.syncFromStorage();
        const latestRefreshToken = this.store.refreshToken();
        const currentTokens = this.store.tokens();
        if (!latestRefreshToken || !currentTokens) {
          throw new Error('No active session is available to refresh');
        }
        if (latestRefreshToken !== refresh_token) return currentTokens;
        const tokens = await firstValueFrom(
          this.http.post<SessionTokens>(`${this.base}/refresh`, {
            refresh_token: latestRefreshToken,
          }),
        );
        this.store.setTokens(tokens);
        return tokens;
      }),
    )
      .pipe(
        catchError((error: unknown) => {
          this.store.clear();
          return throwError(() => error);
        }),
        finalize(() => {
          this.refreshRequest = null;
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    return this.refreshRequest;
  }

  logout(): Observable<void> {
    const refresh_token = this.store.refreshToken();
    if (!refresh_token) {
      this.store.clear();
      return of(undefined);
    }
    return this.http
      .post(`${this.base}/logout`, { refresh_token })
      .pipe(
        map(() => undefined),
        finalize(() => this.store.clear()),
      );
  }

  private loadAccess(): Observable<void> {
    return forkJoin({
      user: this.http
        .get<{ user: SessionUser }>(`${this.base}/perfil`)
        .pipe(map((response) => response.user)),
      permissions: this.http
        .get<{ permissions: EffectivePermission[] }>(`${environment.apiUrl}/permisos`)
        .pipe(map((response) => response.permissions)),
    }).pipe(tap(({ user, permissions }) => this.store.setAccess(user, permissions)), map(() => undefined));
  }

}
