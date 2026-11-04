import { Component, effect, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { Client } from '../../../core/models/client.model';

export interface ClientFormPayload {
  document_type?: string;
  first_name: string;
  last_name: string;
  document_number: string;
  phone: string | null;
  email: string | null;
}

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, MessageModule, SelectModule],
  templateUrl: './client-form.html',
  styleUrl: './client-form.css',
})
export class ClientForm {
  readonly client = input<Client | null>(null);
  readonly saving = input(false);
  readonly error = input<string | null>(null);
  readonly saved = output<ClientFormPayload>();
  readonly cancelled = output<void>();

  readonly documentTypes = [
    { label: 'Cédula de ciudadanía', value: 'CC' },
    { label: 'Cédula de extranjería', value: 'CE' },
    { label: 'Pasaporte', value: 'PASSPORT' },
    { label: 'Otro', value: 'OTHER' },
  ];

  readonly form = new FormGroup({
    document_type: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(30)] }),
    first_name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(100)] }),
    last_name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(100)] }),
    document_number: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(50)] }),
    phone: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(30)] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.email, Validators.maxLength(150)] }),
  });

  constructor() {
    effect(() => {
      const client = this.client();
      this.form.reset({
        document_type: client?.document_type ?? '',
        first_name: client?.first_name ?? '',
        last_name: client?.last_name ?? '',
        document_number: client?.document_number ?? '',
        phone: client?.phone ?? '',
        email: client?.email ?? '',
      });
    });
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.saving()) return;

    const value = this.form.getRawValue();
    const document_type = value.document_type.trim();
    this.saved.emit({
      ...(document_type ? { document_type } : {}),
      first_name: value.first_name.trim(),
      last_name: value.last_name.trim(),
      document_number: value.document_number.trim(),
      phone: value.phone.trim() || null,
      email: value.email.trim() || null,
    });
  }
}
