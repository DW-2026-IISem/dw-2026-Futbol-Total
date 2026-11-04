import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../environments/environment';
import {
  Client,
  ClientCreatePayload,
  ClientPatchPayload,
  ClientReplacePayload,
} from '../../core/models/client.model';
import { ClientApi } from './client-api';

describe('ClientApi', () => {
  let api: ClientApi;
  let httpTestingController: HttpTestingController;
  const clientsUrl = `${environment.apiUrl}/clientes`;
  const client: Client = {
    id: 17,
    user_id: null,
    document_type: 'CC',
    first_name: 'Ana',
    last_name: 'Pérez',
    document_number: '123456789',
    phone: '3001234567',
    email: 'ana@example.com',
    is_active: true,
    createdAt: '2026-11-03T12:00:00.000Z',
    updatedAt: '2026-11-03T12:00:00.000Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    api = TestBed.inject(ClientApi);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('list() requests clients and unwraps the clients response', async () => {
    const result = firstValueFrom(api.list());
    const request = httpTestingController.expectOne(clientsUrl);

    expect(request.request.method).toBe('GET');
    request.flush({ clients: [client] });

    expect(await result).toEqual([client]);
  });

  it('get() requests one client and unwraps the client response', async () => {
    const result = firstValueFrom(api.get(client.id));
    const request = httpTestingController.expectOne(
      `${clientsUrl}/${client.id}`,
    );

    expect(request.request.method).toBe('GET');
    request.flush({ client });

    expect(await result).toEqual(client);
  });

  it('create() posts the payload and unwraps the created client', async () => {
    const payload: ClientCreatePayload = {
      first_name: client.first_name,
      last_name: client.last_name,
      document_number: client.document_number,
      document_type: client.document_type,
    };
    const result = firstValueFrom(api.create(payload));
    const request = httpTestingController.expectOne(clientsUrl);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({ client });

    expect(await result).toEqual(client);
  });

  it('replace() puts the payload and unwraps the replaced client', async () => {
    const payload: ClientReplacePayload = {
      document_type: client.document_type,
      first_name: client.first_name,
      last_name: client.last_name,
      document_number: client.document_number,
    };
    const result = firstValueFrom(api.replace(client.id, payload));
    const request = httpTestingController.expectOne(
      `${clientsUrl}/${client.id}`,
    );

    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(payload);
    request.flush({ client });

    expect(await result).toEqual(client);
  });

  it('update() patches the payload and unwraps the updated client', async () => {
    const payload: ClientPatchPayload = { phone: '3007654321' };
    const result = firstValueFrom(api.update(client.id, payload));
    const request = httpTestingController.expectOne(
      `${clientsUrl}/${client.id}`,
    );

    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(payload);
    request.flush({ client });

    expect(await result).toEqual(client);
  });
});
