import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationService } from './notification';

describe('NotificationService', () => {
  let service: NotificationService;
  let messageService: MessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MessageService, NotificationService],
    });
    service = TestBed.inject(NotificationService);
    messageService = TestBed.inject(MessageService);
  });

  it('sends success notifications through PrimeNG', () => {
    const add = vi.spyOn(messageService, 'add');

    service.success('Cliente creado');

    expect(add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Cliente creado',
      life: 5000,
    });
  });

  it('sends warning notifications through PrimeNG', () => {
    const add = vi.spyOn(messageService, 'add');

    service.warning('Revisa los datos', 'Atención');

    expect(add).toHaveBeenCalledWith({
      severity: 'warn',
      summary: 'Atención',
      detail: 'Revisa los datos',
      life: 6000,
    });
  });

  it('converts HTTP errors into error notifications', () => {
    const add = vi.spyOn(messageService, 'add');
    const error = new HttpErrorResponse({
      status: 401,
      error: { error: 'Unauthorized' },
    });

    service.error(error);

    expect(add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'La sesión no está autenticada o ha caducado.',
      life: 8000,
    });
  });

  it('uses the API error message when one is returned', () => {
    const add = vi.spyOn(messageService, 'add');
    const error = new HttpErrorResponse({
      status: 422,
      error: { error: 'El documento ya está registrado.' },
    });

    service.error(error, 'No se pudo guardar');

    expect(add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'No se pudo guardar',
      detail: 'El documento ya está registrado.',
      life: 8000,
    });
  });
});
