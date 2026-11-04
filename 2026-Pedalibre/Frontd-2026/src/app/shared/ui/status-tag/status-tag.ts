import { Component, computed, input } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { spanishStatus } from '../../../core/utils/spanish-ui';

@Component({
  standalone: true,
  imports: [TagModule],
  selector: 'app-status-tag',
  styleUrl: './status-tag.css',
  templateUrl: './status-tag.html',
})
export class StatusTag {
  readonly value = input.required<string>();
  readonly label = computed(() => spanishStatus(this.value()));
  readonly severity = input<
    'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'
  >('secondary');
}
