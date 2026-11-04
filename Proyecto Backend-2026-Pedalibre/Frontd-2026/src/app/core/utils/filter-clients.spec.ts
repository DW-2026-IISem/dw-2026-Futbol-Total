import { describe, expect, it } from 'vitest';
import { Client } from '../models/client.model';
import { filterClients } from './filter-clients';

const client: Client = {
  id: 1,
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

describe('filterClients', () => {
  it('returns a copy of the full list for a blank query', () => {
    const input = [client];
    const result = filterClients(input, '  ');
    expect(result).toEqual(input);
    expect(result).not.toBe(input);
  });

  it('matches names and documents without case sensitivity', () => {
    expect(filterClients([client], 'PÉREZ')).toEqual([client]);
    expect(filterClients([client], '123456')).toEqual([client]);
  });

  it('tolerates null contact fields and matches email', () => {
    expect(filterClients([client], 'ANA@EXAMPLE')).toEqual([client]);
    expect(filterClients([client], '300')).toEqual([]);
  });
});
