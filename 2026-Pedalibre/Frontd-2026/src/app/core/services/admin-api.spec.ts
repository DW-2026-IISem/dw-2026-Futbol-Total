import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../environments/environment';
import { AdminApi } from './admin-api';

describe('AdminApi', () => {
  let api: AdminApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(AdminApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('unwraps the backend-specific user list', () => {
    let users: unknown[] | undefined;
    api.list('users').subscribe((response) => (users = response));
    const request = http.expectOne(`${environment.apiUrl}/usuarios`);
    expect(request.request.method).toBe('GET');
    request.flush({ users: [{ id: 3, username: 'operator' }] });
    expect(users).toEqual([{ id: 3, username: 'operator' }]);
  });

  it('sends numeric role and resource grant filters as query parameters', () => {
    api.list('grants', { role_id: 2, resource_id: 9 }).subscribe();
    const request = http.expectOne(
      `${environment.apiUrl}/concesiones-rol?role_id=2&resource_id=9`,
    );
    expect(request.request.method).toBe('GET');
    request.flush({ grants: [] });
  });

  it('reactivates a grant on the explicit backend route', () => {
    api.changeGrant(12, true).subscribe();
    const request = http.expectOne(`${environment.apiUrl}/concesiones-rol/12/reactivate`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({});
    request.flush({ message: 'Grant reactivated', grant: { id: 12, status: 'active' } });
  });
});
