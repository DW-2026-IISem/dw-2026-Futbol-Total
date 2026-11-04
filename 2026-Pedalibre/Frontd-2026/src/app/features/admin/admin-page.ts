import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { AdminApi } from '../../core/services/admin-api';
import { AdminResource, AdminRole, AdminUser, RoleGrant } from '../../core/models/admin.model';
import { SessionStore } from '../../core/services/session-store';
import { toApiMessage } from '../../core/utils/to-api-message';
import { spanishColumn, spanishStatus } from '../../core/utils/spanish-ui';
import { PageHeader } from '../../shared/ui/page-header/page-header';

type AdminSection = 'users' | 'roles' | 'resources' | 'grants';

interface AdminField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'password' | 'select';
  required?: boolean;
  create?: boolean;
  update?: boolean;
}

const fieldsBySection: Record<AdminSection, AdminField[]> = {
  users: [
    { key: 'role_id', label: 'ID de rol', type: 'number', required: true },
    { key: 'username', label: 'Usuario', type: 'text', required: true },
    { key: 'email', label: 'Correo', type: 'text', required: true },
    { key: 'password', label: 'Contraseña inicial', type: 'password', required: true, update: false },
  ],
  roles: [
    { key: 'name', label: 'Nombre', type: 'text', required: true },
    { key: 'description', label: 'Descripción', type: 'text' },
  ],
  resources: [
    { key: 'method', label: 'Método HTTP', type: 'select', required: true },
    { key: 'path', label: 'Ruta API', type: 'text', required: true },
    { key: 'description', label: 'Descripción', type: 'text' },
  ],
  grants: [
    { key: 'role_id', label: 'ID de rol', type: 'number', required: true },
    { key: 'resource_id', label: 'ID de recurso', type: 'number', required: true },
  ],
};

const sectionCopy: Record<AdminSection, [string, string]> = {
  users: ['Usuarios', 'Administra las cuentas y asigna a cada persona el rol que necesita.'],
  roles: ['Roles', 'Administra el catálogo de roles PedalLibre.'],
  resources: ['Recursos', 'Administra las rutas y operaciones disponibles en el sistema.'],
  grants: ['Permisos por rol', 'Asigna, revoca o reactiva los permisos de cada rol.'],
};

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [ButtonModule, InputTextModule, MessageModule, TableModule, PageHeader],
  templateUrl: './admin-page.html',
})
export class AdminPage implements OnInit {
  private readonly api = inject(AdminApi);
  private readonly route = inject(ActivatedRoute);
  private readonly session = inject(SessionStore);
  readonly section: AdminSection;
  readonly fields: AdminField[];
  readonly title: string;
  readonly description: string;
  readonly rows = signal<Array<AdminUser | AdminRole | AdminResource | RoleGrant>>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly formError = signal<string | null>(null);
  readonly draft = signal<Record<string, string>>({});
  readonly editing = signal<(AdminUser | AdminRole | AdminResource) | null>(null);
  readonly query = signal('');
  readonly roleFilter = signal('');
  readonly resourceFilter = signal('');
  readonly visibleRows = computed(() => {
    const query = this.query().trim().toLowerCase();
    return query
      ? this.rows().filter((row) =>
          Object.values(row).some((value) => String(value ?? '').toLowerCase().includes(query)),
        )
      : this.rows();
  });
  readonly endpoint = computed(() =>
    this.section === 'users'
      ? 'usuarios'
      : this.section === 'resources'
        ? 'recursos'
        : this.section === 'grants'
          ? 'concesiones-rol'
          : 'roles',
  );
  readonly canCreate = computed(() =>
    this.section === 'grants'
      ? this.session.canPermission('POST /api/concesiones-rol')
      : this.session.canPermission(`POST /api/${this.endpoint()}`),
  );
  readonly canUpdate = computed(() =>
    this.section !== 'grants' &&
    this.session.canPermission(`PATCH /api/${this.endpoint()}/:id`),
  );
  readonly canDeactivate = computed(() =>
    this.section === 'grants'
      ? this.session.canPermission('PATCH /api/concesiones-rol/:id/deactivate')
      : this.session.canPermission(`PATCH /api/${this.endpoint()}/:id/deactivate`),
  );
  readonly canReactivateGrant = computed(() =>
    this.session.canPermission('PATCH /api/concesiones-rol/:id/reactivate'),
  );
  readonly canDelete = computed(() =>
    this.section !== 'grants' &&
    this.session.canPermission(`DELETE /api/${this.endpoint()}/:id`),
  );
  readonly columns = computed(() => {
    const row = this.rows()[0];
    return row ? Object.keys(row).filter((key) => key !== 'password_hash') : [];
  });

  constructor() {
    this.section = this.route.snapshot.data['adminSection'] as AdminSection;
    if (!(this.section in fieldsBySection)) throw new Error('Unknown administration section');
    this.fields = fieldsBySection[this.section];
    [this.title, this.description] = sectionCopy[this.section];
    this.resetDraft();
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const role_id = positiveFilter(this.roleFilter());
    const resource_id = positiveFilter(this.resourceFilter());
    if (role_id === null || resource_id === null) {
      this.error.set('Los filtros deben ser IDs enteros positivos.');
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.api.list(this.section, {
      ...(role_id ? { role_id } : {}),
      ...(resource_id ? { resource_id } : {}),
    }).subscribe({
      next: (rows) => {
        this.rows.set(rows);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.error.set(toApiMessage(error));
        this.loading.set(false);
      },
    });
  }

  setValue(key: string, event: Event): void {
    this.draft.update((draft) => ({
      ...draft,
      [key]: (event.target as HTMLInputElement).value,
    }));
  }

  setQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  setFilter(key: 'role' | 'resource', event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    (key === 'role' ? this.roleFilter : this.resourceFilter).set(value);
  }

  startCreate(): void {
    this.editing.set(null);
    this.formError.set(null);
    this.resetDraft();
  }

  startEdit(row: AdminUser | AdminRole | AdminResource): void {
    this.editing.set(row);
    this.formError.set(null);
    this.draft.set(
      Object.fromEntries(this.fields.map((field) => [field.key, String((row as unknown as Record<string, unknown>)[field.key] ?? '')])),
    );
  }

  save(): void {
    if (this.saving() || this.section === 'grants') return;
    const current = this.editing();
    if (current ? !this.canUpdate() : !this.canCreate()) return;
    const payload: Record<string, unknown> = {};
    for (const field of this.fields) {
      if (current && field.update === false) continue;
      if (!current && field.create === false) continue;
      const raw = this.draft()[field.key]?.trim() ?? '';
      if (!raw) {
        if (field.required) {
          this.formError.set(`${field.label} es obligatorio.`);
          return;
        }
        continue;
      }
      if (field.type === 'number') {
        const value = Number(raw);
        if (!Number.isSafeInteger(value) || value < 1) {
          this.formError.set(`${field.label} debe ser un ID entero positivo.`);
          return;
        }
        payload[field.key] = value;
      } else {
        payload[field.key] = raw;
      }
    }

    this.saving.set(true);
    this.formError.set(null);
    const request = current
      ? this.api.update(this.section, current.id, payload)
      : this.api.create(this.section, payload);
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.startCreate();
        this.load();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.formError.set(toApiMessage(error));
      },
    });
  }

  submitGrant(): void {
    if (this.saving() || !this.canCreate()) return;
    const role_id = Number(this.draft()['role_id']);
    const resource_id = Number(this.draft()['resource_id']);
    if (!Number.isSafeInteger(role_id) || role_id < 1 || !Number.isSafeInteger(resource_id) || resource_id < 1) {
      this.formError.set('Los IDs de rol y recurso deben ser enteros positivos.');
      return;
    }
    this.saving.set(true);
    this.formError.set(null);
    this.api.grant(role_id, resource_id).subscribe({
      next: () => {
        this.saving.set(false);
        this.resetDraft();
        this.load();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.formError.set(toApiMessage(error));
      },
    });
  }

  deactivate(row: AdminUser | AdminRole | AdminResource): void {
    if (!this.canDeactivate()) return;
    if (!window.confirm(`¿Desactivar el registro ${row.id}?`)) return;
    this.api.deactivate(this.section as Exclude<AdminSection, 'grants'>, row.id).subscribe({
      next: () => this.load(),
      error: (error: unknown) => this.error.set(toApiMessage(error)),
    });
  }

  remove(row: AdminUser | AdminRole | AdminResource): void {
    if (!this.canDelete()) return;
    if (!window.confirm(`Eliminación permanente: ¿borrar el registro ${row.id}?`)) return;
    this.api.remove(this.section as Exclude<AdminSection, 'grants'>, row.id).subscribe({
      next: () => this.load(),
      error: (error: unknown) => this.error.set(toApiMessage(error)),
    });
  }

  changeGrant(row: RoleGrant): void {
    const activating = row.status !== 'active';
    if (activating ? !this.canReactivateGrant() : !this.canDeactivate()) return;
    this.api.changeGrant(row.id, activating).subscribe({
      next: () => this.load(),
      error: (error: unknown) => this.error.set(toApiMessage(error)),
    });
  }

  display(value: unknown): string {
    if (value === null || value === undefined || value === '') return '—';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  columnLabel(column: string): string {
    return spanishColumn(column);
  }

  displayColumn(column: string, value: unknown): string {
    if (column === 'status') return spanishStatus(value);
    if (column === 'is_active') return value ? 'Activo' : 'Inactivo';
    if (column === 'name' && typeof value === 'string') {
      const roleNames: Record<string, string> = {
        ADMIN: 'Administrador',
        CLIENTE: 'Cliente',
        MANTENIMIENTO: 'Mantenimiento',
        OPERACIONES: 'Operaciones',
        SOPORTE: 'Soporte',
      };
      return roleNames[value] ?? value;
    }
    return this.display(value);
  }

  private resetDraft(): void {
    this.draft.set(Object.fromEntries(this.fields.map((field) => [field.key, ''])));
  }
}

function positiveFilter(value: string): number | null | undefined {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}
