import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BusinessRecord } from '../models/business-resource.model';

@Injectable({ providedIn: 'root' })
export class BusinessApi {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  list(endpoint: string, envelope = 'items'): Observable<BusinessRecord[]> {
    return this.http
      .get<Record<string, unknown>>(`${this.base}/${endpoint}`)
      .pipe(map((response) => requiredArray<BusinessRecord>(response, envelope)));
  }

  availableBicycles(): Observable<BusinessRecord[]> {
    return this.http
      .get<Record<string, unknown>>(`${this.base}/bicycles/available`)
      .pipe(map((response) => requiredArray<BusinessRecord>(response, 'bicycles')));
  }

  create<T>(endpoint: string, payload: Record<string, unknown>, envelope = 'item'): Observable<T> {
    return this.http
      .post<Record<string, unknown>>(`${this.base}/${endpoint}`, payload)
      .pipe(map((response) => requiredValue<T>(response, envelope)));
  }

  update<T>(
    endpoint: string,
    id: number,
    payload: Record<string, unknown>,
    method: 'PATCH' | 'PUT' = 'PATCH',
    envelope = 'item',
  ): Observable<T> {
    const url = `${this.base}/${endpoint}/${id}`;
    const request =
      method === 'PUT'
        ? this.http.put<Record<string, unknown>>(url, payload)
        : this.http.patch<Record<string, unknown>>(url, payload);
    return request.pipe(map((response) => requiredValue<T>(response, envelope)));
  }

  remove(endpoint: string, id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${endpoint}/${id}`);
  }

  patchAction<T>(endpoint: string, payload: Record<string, unknown>, envelope: string): Observable<T> {
    return this.http
      .patch<Record<string, unknown>>(`${this.base}/${endpoint}`, payload)
      .pipe(map((response) => requiredValue<T>(response, envelope)));
  }

  patchItemAction<T>(
    endpoint: string,
    id: number,
    action: string,
    payload: Record<string, unknown>,
    envelope: string,
  ): Observable<T> {
    return this.http
      .patch<Record<string, unknown>>(`${this.base}/${endpoint}/${id}/${action}`, payload)
      .pipe(map((response) => requiredValue<T>(response, envelope)));
  }
}

function requiredArray<T>(response: Record<string, unknown>, key: string): T[] {
  const value = response[key];
  if (!Array.isArray(value)) {
    throw new TypeError(`La respuesta del API no contiene una lista válida "${key}".`);
  }
  return value as T[];
}

function requiredValue<T>(response: Record<string, unknown>, key: string): T {
  if (!(key in response)) {
    throw new TypeError(`La respuesta del API no contiene el dato esperado "${key}".`);
  }
  return response[key] as T;
}
