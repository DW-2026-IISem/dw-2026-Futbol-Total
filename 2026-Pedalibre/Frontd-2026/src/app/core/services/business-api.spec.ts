import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../environments/environment';
import { BusinessApi } from './business-api';

describe('BusinessApi', () => {
  let api: BusinessApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(BusinessApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('unwraps the configured collection envelope', () => {
    let rows: unknown[] | undefined;
    api.list('stations').subscribe((response) => (rows = response));
    const request = http.expectOne(`${environment.apiUrl}/stations`);
    expect(request.request.method).toBe('GET');
    request.flush({ items: [{ id: 1, name: 'Centro' }] });
    expect(rows).toEqual([{ id: 1, name: 'Centro' }]);
  });

  it('uses the special envelope for the available bicycle list', () => {
    let rows: unknown[] | undefined;
    api.availableBicycles().subscribe((response) => (rows = response));
    const request = http.expectOne(`${environment.apiUrl}/bicycles/available`);
    expect(request.request.method).toBe('GET');
    request.flush({ bicycles: [{ id: 8, status: 'available' }] });
    expect(rows).toEqual([{ id: 8, status: 'available' }]);
  });

  it('posts the exact transaction payload and unwraps the resource envelope', () => {
    let result: unknown;
    api.create('rentals/start', { reservation_id: 3 }, 'rental')
      .subscribe((response) => (result = response));
    const request = http.expectOne(`${environment.apiUrl}/rentals/start`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ reservation_id: 3 });
    request.flush({ rental: { id: 14, status: 'active' } });
    expect(result).toEqual({ id: 14, status: 'active' });
  });

  it('uses the explicit movement endpoint to undock', () => {
    let result: unknown;
    api.patchItemAction('bicycle-dockings', 4, 'undock', {}, 'docking')
      .subscribe((response) => (result = response));
    const request = http.expectOne(`${environment.apiUrl}/bicycle-dockings/4/undock`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({});
    request.flush({ docking: { id: 4, undocked_at: '2026-11-04T10:00:00.000Z' } });
    expect(result).toEqual({ id: 4, undocked_at: '2026-11-04T10:00:00.000Z' });
  });

  it('patches an item and deletes it using the resource URL', () => {
    api.update('stations', 5, { name: 'New name' }).subscribe();
    const update = http.expectOne(`${environment.apiUrl}/stations/5`);
    expect(update.request.method).toBe('PATCH');
    expect(update.request.body).toEqual({ name: 'New name' });
    update.flush({ item: { id: 5, name: 'New name' } });

    api.remove('stations', 5).subscribe();
    const remove = http.expectOne(`${environment.apiUrl}/stations/5`);
    expect(remove.request.method).toBe('DELETE');
    remove.flush({ message: 'Station permanently deleted', id: 5 });
  });

  it('fails explicitly when the response envelope is missing', () => {
    let error: unknown;
    api.list('stations').subscribe({ error: (cause: unknown) => (error = cause) });
    http.expectOne(`${environment.apiUrl}/stations`).flush({ stations: [] });
    expect(error).toBeInstanceOf(TypeError);
  });
});
