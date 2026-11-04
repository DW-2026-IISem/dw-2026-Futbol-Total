import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../../environments/environment';
import { Client } from '../../../core/models/client.model';
import { MessageService } from 'primeng/api';
import { ClientFormPayload } from '../client-form/client-form';
import { ClientList } from './client-list';

describe('ClientList save', () => {
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
  const payload: ClientFormPayload = {
    document_type: 'CC',
    first_name: 'Ana',
    last_name: 'Pérez',
    document_number: '123456789',
    phone: null,
    email: 'ana@example.com',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientList],
      providers: [provideHttpClient(), provideHttpClientTesting(), MessageService],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  function createList() {
    const fixture = TestBed.createComponent(ClientList);
    fixture.detectChanges();
    http.expectOne(url).flush({ clients: [client] });
    return fixture.componentInstance;
  }

  it('creates a client with POST and reloads only after success', () => {
    const component = createList();
    component.openCreate();
    component.save(payload);

    const request = http.expectOne(url);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({ client });

    expect(component.dialogVisible()).toBe(false);
    http.expectOne(url).flush({ clients: [client] });
  });

  it('updates a client with PATCH and does not send is_active', () => {
    const component = createList();
    component.openEdit(client);
    component.save({ ...payload, phone: '3001234567' });

    const request = http.expectOne(`${url}/${client.id}`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ ...payload, phone: '3001234567' });
    expect(request.request.body).not.toHaveProperty('is_active');
    request.flush({ client: { ...client, phone: '3001234567' } });

    expect(component.dialogVisible()).toBe(false);
    http.expectOne(url).flush({ clients: [client] });
  });

  it('keeps the dialog open and reports a conflict when save fails', () => {
    const component = createList();
    component.openCreate();
    component.save(payload);

    http.expectOne(url).flush(
      { error: 'El documento ya existe' },
      { status: 409, statusText: 'Conflict' },
    );

    expect(component.dialogVisible()).toBe(true);
    expect(component.saving()).toBe(false);
    expect(component.formError()).toBeTruthy();
    http.expectNone(url);
  });
});
