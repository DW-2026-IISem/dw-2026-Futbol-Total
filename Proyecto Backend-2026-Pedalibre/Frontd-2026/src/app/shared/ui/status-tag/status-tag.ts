import { Component, input } from '@angular/core';
import { TagModule } from 'primeng/tag';

@Component({
  standalone: true,
  imports: [TagModule],
  selector: 'app-status-tag',
  styleUrl: './status-tag.css',
  templateUrl: './status-tag.html',
})
export class StatusTag {
  readonly value = input.required<string>();
  readonly severity = input<
    'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'
  >('secondary');
}
