import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminResource, AdminRole, AdminUser, RoleGrant } from '../models/admin.model';

type AdminEntity = 'users' | 'roles' | 'resources' | 'grants';

const entityConfig: Record<AdminEntity, { endpoint: string; collection: string; item: string }> = {
  users: { endpoint: 'usuarios', collection: 'users', item: 'user' },
  roles: { endpoint: 'roles', collection: 'roles', item: 'role' },
  resources: { endpoint: 'recursos', collection: 'resources', item: 'resource' },
  grants: { endpoint: 'concesiones-rol', collection: 'grants', item: 'grant' },
};

@Injectable({ providedIn: 'root' })
export class AdminApi {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  list(entity: AdminEntity, filters: { role_id?: number; resource_id?: number } = {}): Observable<Array<AdminUser | AdminRole | AdminResource | RoleGrant>> {
    const config = entityConfig[entity];
    let params = new HttpParams();
    if (filters.role_id !== undefined) params = params.set('role_id', filters.role_id);
    if (filters.resource_id !== undefined) params = params.set('resource_id', filters.resource_id);
    return this.http
      .get<Record<string, unknown>>(`${this.base}/${config.endpoint}`, { params })
      .pipe(
        map((response) =>
          requiredArray<AdminUser | AdminRole | AdminResource | RoleGrant>(
            response,
            config.collection,
          ),
        ),
      );
  }

  create(entity: Exclude<AdminEntity, 'grants'>, payload: Record<string, unknown>): Observable<unknown> {
    const config = entityConfig[entity];
    return this.http
      .post<Record<string, unknown>>(`${this.base}/${config.endpoint}`, payload)
      .pipe(map((response) => requiredValue(response, config.item)));
  }

  update(entity: Exclude<AdminEntity, 'grants'>, id: number, payload: Record<string, unknown>): Observable<unknown> {
    const config = entityConfig[entity];
    return this.http
      .patch<Record<string, unknown>>(`${this.base}/${config.endpoint}/${id}`, payload)
      .pipe(map((response) => requiredValue(response, config.item)));
  }

  deactivate(entity: Exclude<AdminEntity, 'grants'>, id: number): Observable<unknown> {
    const config = entityConfig[entity];
    return this.http
      .patch<Record<string, unknown>>(`${this.base}/${config.endpoint}/${id}/deactivate`, {})
      .pipe(map((response) => requiredValue(response, config.item)));
  }

  remove(entity: Exclude<AdminEntity, 'grants'>, id: number): Observable<{ message: string; id: number }> {
    const config = entityConfig[entity];
    return this.http.delete<{ message: string; id: number }>(`${this.base}/${config.endpoint}/${id}`);
  }

  grant(role_id: number, resource_id: number): Observable<RoleGrant> {
    return this.http
      .post<{ message: string; grant: RoleGrant }>(`${this.base}/concesiones-rol`, {
        role_id,
        resource_id,
      })
      .pipe(map((response) => response.grant));
  }

  changeGrant(id: number, activate: boolean): Observable<RoleGrant> {
    const action = activate ? 'reactivate' : 'deactivate';
    return this.http
      .patch<{ message: string; grant: RoleGrant }>(
        `${this.base}/concesiones-rol/${id}/${action}`,
        {},
      )
      .pipe(map((response) => response.grant));
  }
}

function requiredArray<T>(response: Record<string, unknown>, key: string): T[] {
  const value = response[key];
  if (!Array.isArray(value)) throw new TypeError(`The API response does not contain "${key}" array`);
  return value as T[];
}

function requiredValue(response: Record<string, unknown>, key: string): unknown {
  if (!(key in response)) throw new TypeError(`The API response does not contain "${key}"`);
  return response[key];
}
