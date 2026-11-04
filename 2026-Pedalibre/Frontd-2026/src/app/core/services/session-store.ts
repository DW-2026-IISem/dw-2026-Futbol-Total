import { Injectable, computed, signal } from '@angular/core';
import {
  EffectivePermission,
  SessionTokens,
  SessionUser,
} from '../models/session.model';

const STORAGE_KEY = 'pedalibre.session.v1';

interface SessionState {
  tokens: SessionTokens;
  user: SessionUser | null;
  permissions: EffectivePermission[];
}

@Injectable({ providedIn: 'root' })
export class SessionStore {
  private readonly state = signal<SessionState | null>(this.restore());
  readonly tokens = computed(() => this.state()?.tokens ?? null);
  readonly accessToken = computed(() => this.state()?.tokens.access_token ?? null);
  readonly refreshToken = computed(() => this.state()?.tokens.refresh_token ?? null);
  readonly user = computed(() => this.state()?.user ?? null);
  readonly permissions = computed(() => this.state()?.permissions ?? []);
  readonly isAuthenticated = computed(() => Boolean(this.accessToken()));
  readonly isClientAccount = computed(() =>
    this.permissions().some((permission) => permission.role_name.toUpperCase() === 'CLIENTE'),
  );
  readonly isAdminAccount = computed(() =>
    this.permissions().some((permission) => permission.role_name.toUpperCase() === 'ADMIN'),
  );

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key === STORAGE_KEY) this.syncFromStorage();
      });
    }
  }

  setTokens(tokens: SessionTokens): void {
    const current = this.state();
    this.persist({ tokens, user: current?.user ?? null, permissions: current?.permissions ?? [] });
  }

  setAccess(user: SessionUser, permissions: EffectivePermission[]): void {
    const tokens = this.state()?.tokens;
    if (!tokens) throw new Error('Session tokens must be set before session access');
    this.persist({ tokens, user, permissions });
  }

  canPermission(permission: string): boolean {
    const separator = permission.indexOf(' ');
    if (separator <= 0) return false;
    const method = permission.slice(0, separator).toUpperCase();
    const path = normalizePath(permission.slice(separator + 1));
    return this.permissions().some(
      (item) =>
        item.method.toUpperCase() === method &&
        pathMatches(normalizePath(item.path), path),
    );
  }

  clear(): void {
    this.state.set(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Could not clear the PedalLibre session storage', error);
    }
  }

  syncFromStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        this.state.set(null);
        return;
      }
      const value: unknown = JSON.parse(raw);
      if (!isSessionState(value)) {
        this.state.set(null);
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      this.state.set(value);
    } catch (error) {
      console.error('Could not synchronize the PedalLibre session', error);
    }
  }

  private persist(state: SessionState): void {
    this.state.set(state);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Could not persist the PedalLibre session', error);
    }
  }

  private restore(): SessionState | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const value: unknown = JSON.parse(raw);
      if (!isSessionState(value)) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return value;
    } catch (error) {
      console.error('Could not restore the PedalLibre session', error);
      return null;
    }
  }
}

function isSessionState(value: unknown): value is SessionState {
  if (!value || typeof value !== 'object') return false;
  const state = value as Partial<SessionState>;
  return Boolean(
    state.tokens &&
      typeof state.tokens.access_token === 'string' &&
      typeof state.tokens.refresh_token === 'string' &&
      Array.isArray(state.permissions) &&
      (state.user === null || typeof state.user === 'object'),
  );
}

function normalizePath(path: string): string {
  return path.split('?')[0].replace(/\/+$/, '') || '/';
}

function pathMatches(granted: string, requested: string): boolean {
  const pattern = granted
    .split('/')
    .map((part) => (part.startsWith(':') ? '[^/]+' : escapeRegex(part)))
    .join('/');
  return new RegExp(`^${pattern}/?$`).test(requested);
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
