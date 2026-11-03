import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { toApiMessage } from '../utils/to-api-message';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly messageService = inject(MessageService);

  success(detail: string, summary = 'Éxito'): void {
    this.messageService.add({
      severity: 'success',
      summary,
      detail,
      life: 5000,
    });
  }

  warning(detail: string, summary = 'Atención'): void {
    this.messageService.add({
      severity: 'warn',
      summary,
      detail,
      life: 6000,
    });
  }

  error(error: unknown, summary = 'Error'): void {
    this.messageService.add({
      severity: 'error',
      summary,
      detail: toApiMessage(error),
      life: 8000,
    });
  }
}
