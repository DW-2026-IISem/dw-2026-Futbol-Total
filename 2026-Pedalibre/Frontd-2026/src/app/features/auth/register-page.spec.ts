import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SessionApi } from '../../core/services/session-api';
import { RegisterPage } from './register-page';

describe('RegisterPage', () => {
  const sessionApi = { registerClient: vi.fn(() => of(undefined)) };

  beforeEach(() => {
    sessionApi.registerClient.mockClear();
    TestBed.configureTestingModule({
      imports: [RegisterPage],
      providers: [
        provideRouter([]),
        { provide: SessionApi, useValue: sessionApi },
      ],
    });
  });

  it('submits a client registration and shows confirmation', () => {
    const component = TestBed.createComponent(RegisterPage).componentInstance;
    component.username = 'new-client';
    component.email = 'client@example.test';
    component.password = 'a-secure-password';
    component.confirm_password = 'a-secure-password';
    component.first_name = 'New';
    component.last_name = 'Client';
    component.document_type = 'CC';
    component.document_number = '123456789';

    component.submit();

    expect(sessionApi.registerClient).toHaveBeenCalledWith({
      username: 'new-client',
      email: 'client@example.test',
      password: 'a-secure-password',
      first_name: 'New',
      last_name: 'Client',
      document_type: 'CC',
      document_number: '123456789',
      phone: null,
    });
    expect(component.success()).toBe(true);
  });

  it('does not send a registration when passwords do not match', () => {
    const component = TestBed.createComponent(RegisterPage).componentInstance;
    component.password = 'password-one';
    component.confirm_password = 'password-two';

    component.submit();

    expect(sessionApi.registerClient).not.toHaveBeenCalled();
    expect(component.error()).toBe('Las contraseñas no coinciden.');
  });
});
