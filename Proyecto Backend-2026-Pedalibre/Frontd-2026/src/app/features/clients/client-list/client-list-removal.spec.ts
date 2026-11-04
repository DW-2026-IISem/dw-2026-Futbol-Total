import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { environment } from '../../../../environments/environment';
import { Client } from '../../../core/models/client.model';
import { ClientList } from './client-list';

describe('ClientList client removal', () => {
  let http: HttpTestingController;
  const url = `${environment.apiUrl}/clientes`;
  const client: Client = {
    id: 17,
    user_id: null,
    document_type: 'CC',
    first_name: 'Ana',
    last_name: 'Pérez',
    document_number: '123456789',
    phone: null,
    email: 'ana@example.com',
    is_active: true,
    createdAt: '2026-11-03T12:00:00.000Z',
    updatedAt: '2026-11-03T12:00:00.000Z',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientList],
      providers: [provideHttpClient(), provideHttpClientTesting(), MessageService],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    vi.restoreAllMocks();
  });

  function createList() {
    const fixture = TestBed.createComponent(ClientList);
    fixture.detectChanges();
    http.expectOne(url).flush({ clients: [client] });
    return fixture.componentInstance;
  }

  it('does not deactivate when confirmation is cancelled', () => {
    const component = createList();
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    component.deactivate(client);

    expect(window.confirm).toHaveBeenCalledOnce();
    http.expectNone(`${url}/${client.id}/deactivate`);
  });

  it('deactivates with PATCH only after confirmation and reloads', () => {
    const component = createList();
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    component.deactivate(client);

    const request = http.expectOne(`${url}/${client.id}/deactivate`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({});
    request.flush({ message: 'Client deactivated', client: { ...client, is_active: false } });
    http.expectOne(url).flush({ clients: [] });
  });

  it('does not physically delete when confirmation is cancelled', () => {
    const component = createList();
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    component.remove(client);

    expect(window.confirm).toHaveBeenCalledOnce();
    http.expectNone(`${url}/${client.id}`);
  });

  it('uses DELETE only after confirmation and reloads after success', () => {
    const component = createList();
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    component.remove(client);

    const request = http.expectOne(`${url}/${client.id}`);
    expect(request.request.method).toBe('DELETE');
    request.flush({ message: 'Client permanently deleted', id: client.id });
    http.expectOne(url).flush({ clients: [] });
  });

  it('keeps the client in the list when DELETE is rejected by the backend', () => {
    const component = createList();
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    component.remove(client);
    http.expectOne(`${url}/${client.id}`).flush(
      { error: 'El cliente tiene reservas asociadas' },
      { status: 409, statusText: 'Conflict' },
    );

    expect(component.clients()).toEqual([client]);
    http.expectNone(url);
  });
});
