import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { Client } from '../../../core/models/client.model';
import { NotificationService } from '../../../core/services/notification';
import { filterClients } from '../../../core/utils/filter-clients';
import { PageHeader } from '../../../shared/ui/page-header/page-header';
import { ClientApi } from '../client-api';
import { ClientForm, ClientFormPayload } from '../client-form/client-form';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [ButtonModule, DialogModule, InputTextModule, MessageModule, TableModule, PageHeader, ClientForm],
  templateUrl: './client-list.html',
  styleUrl: './client-list.css',
})
export class ClientList implements OnInit {
  private readonly api = inject(ClientApi);
  private readonly notify = inject(NotificationService);

  readonly clients = signal<Client[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly formError = signal<string | null>(null);
  readonly query = signal('');
  readonly visibleClients = computed(() => filterClients(this.clients(), this.query()));
  readonly dialogVisible = signal(false);
  readonly editing = signal<Client | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.list().subscribe({
      next: (clients) => {
        this.clients.set(clients);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.error.set('No se pudieron cargar los clientes. Actualiza la página o inténtalo de nuevo.');
        this.notify.error(error, 'Error al cargar clientes');
        this.loading.set(false);
      },
    });
  }

  setQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  openCreate(): void {
    this.editing.set(null);
    this.formError.set(null);
    this.dialogVisible.set(true);
  }

  openEdit(client: Client): void {
    this.editing.set(client);
    this.formError.set(null);
    this.dialogVisible.set(true);
  }

  closeDialog(): void {
    if (this.saving()) return;
    this.dialogVisible.set(false);
    this.editing.set(null);
    this.formError.set(null);
  }

  save(payload: ClientFormPayload): void {
    if (this.saving()) return;
    this.saving.set(true);
    this.formError.set(null);
    const current = this.editing();
    const request = current
      ? this.api.update(current.id, payload)
      : this.api.create(payload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.editing.set(null);
        this.notify.success(current ? 'Cliente actualizado.' : 'Cliente creado.');
        this.load();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.formError.set('No se pudo guardar el cliente. Revisa los datos y permisos e inténtalo de nuevo.');
        this.notify.error(error, 'Error al guardar cliente');
      },
    });
  }

  deactivate(client: Client): void {
    if (!window.confirm(`¿Desactivar a ${client.first_name} ${client.last_name}?`)) return;
    this.api.deactivate(client.id).subscribe({
      next: () => {
        this.notify.success('Cliente desactivado.');
        this.load();
      },
      error: (error: unknown) => this.notify.error(error, 'No se pudo desactivar'),
    });
  }

  remove(client: Client): void {
    const name = `${client.first_name} ${client.last_name}`;
    if (!window.confirm(`Eliminación permanente: ¿borrar a ${name}? Esta acción no se puede deshacer.`)) return;
    this.api.remove(client.id).subscribe({
      next: () => {
        this.notify.success('Cliente eliminado permanentemente.');
        this.load();
      },
      error: (error: unknown) => this.notify.error(error, 'No se pudo eliminar'),
    });
  }
}
