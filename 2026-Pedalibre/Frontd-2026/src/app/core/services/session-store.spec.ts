import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SessionTokens } from '../models/session.model';
import { SessionStore } from './session-store';

describe('SessionStore', () => {
  let store: SessionStore;
  const tokens: SessionTokens = {
    access_token: 'access',
    token_type: 'Bearer',
    expires_in: 900,
    refresh_token: 'refresh',
    refresh_expires_in: 3600,
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    store = TestBed.inject(SessionStore);
  });

  afterEach(() => localStorage.clear());

  it('matches exact method and parameterized resource paths only', () => {
    store.setTokens(tokens);
    store.setAccess(
      { id: 1, role_id: 2, username: 'test', email: null, status: 'active' },
      [
        {
          resource_id: 3,
          method: 'PATCH',
          path: '/api/bicycle-dockings/:id/undock',
          description: null,
          role_id: 2,
          role_name: 'OPERACIONES',
        },
      ],
    );
    expect(store.canPermission('PATCH /api/bicycle-dockings/42/undock')).toBe(true);
    expect(store.canPermission('GET /api/bicycle-dockings/42/undock')).toBe(false);
    expect(store.canPermission('PATCH /api/bicycle-dockings/42/undock/extra')).toBe(false);
  });

  it('clears tokens, profile, permissions and persistent storage', () => {
    store.setTokens(tokens);
    store.clear();
    expect(store.isAuthenticated()).toBe(false);
    expect(store.permissions()).toEqual([]);
    expect(localStorage.getItem('pedalibre.session.v1')).toBeNull();
  });
});
