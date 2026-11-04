import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { SessionStore } from '../../core/services/session-store';
import { HasPermission } from './has-permission';

@Component({
  standalone: true,
  imports: [HasPermission],
  template: `<span *appHasPermission="'GET /api/stations'">Permitido</span>`,
})
class PermissionHost {}

describe('HasPermission', () => {
  let fixture: ComponentFixture<PermissionHost>;
  let session: SessionStore;

  it('updates the embedded view when effective permissions change', () => {
    TestBed.configureTestingModule({ imports: [PermissionHost] });
    session = TestBed.inject(SessionStore);
    fixture = TestBed.createComponent(PermissionHost);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Permitido');

    session.setTokens({
      access_token: 'access',
      token_type: 'Bearer',
      expires_in: 900,
      refresh_token: 'refresh',
      refresh_expires_in: 3600,
    });
    session.setAccess(
      { id: 1, role_id: 1, username: 'test', email: null, status: 'active' },
      [{
        resource_id: 4,
        method: 'GET',
        path: '/api/stations',
        description: null,
        role_id: 1,
        role_name: 'ADMIN',
      }],
    );
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Permitido');

    session.setAccess(
      { id: 1, role_id: 1, username: 'test', email: null, status: 'active' },
      [],
    );
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Permitido');
  });
});
