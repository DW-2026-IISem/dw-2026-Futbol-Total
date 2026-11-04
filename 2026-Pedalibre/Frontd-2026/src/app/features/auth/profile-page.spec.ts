import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { SessionStore } from '../../core/services/session-store';
import { ProfilePage } from './profile-page';

describe('ProfilePage', () => {
  it('shows account details without exposing role IDs or API permissions', async () => {
    await TestBed.configureTestingModule({
      imports: [ProfilePage],
      providers: [
        {
          provide: SessionStore,
          useValue: {
            user: signal({
              id: 8,
              role_id: 5,
              username: 'client',
              email: 'client@example.test',
              status: 'active',
            }),
            permissions: signal([
              {
                resource_id: 1,
                method: 'GET',
                path: '/api/reservations',
                description: null,
                role_id: 5,
                role_name: 'CLIENTE',
              },
            ]),
            isAdminAccount: signal(false),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ProfilePage);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('client');
    expect(fixture.nativeElement.textContent).not.toContain('Permisos efectivos');
    expect(fixture.nativeElement.textContent).not.toContain('/api/');
    expect(fixture.nativeElement.textContent).not.toContain('ID del rol');
  });

  it('shows role ID and effective API permissions to administrators', async () => {
    const permissions = [
      {
        resource_id: 1,
        method: 'GET',
        path: '/api/roles',
        description: null,
        role_id: 1,
        role_name: 'ADMIN',
      },
    ];
    await TestBed.configureTestingModule({
      imports: [ProfilePage],
      providers: [
        {
          provide: SessionStore,
          useValue: {
            user: signal({
              id: 1,
              role_id: 1,
              username: 'admin',
              email: 'admin@example.test',
              status: 'active',
            }),
            permissions: signal(permissions),
            isAdminAccount: signal(true),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ProfilePage);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('ID del rol');
    expect(fixture.nativeElement.textContent).toContain('Permisos efectivos (1)');
    expect(fixture.nativeElement.textContent).toContain('GET /api/roles');
  });
});
