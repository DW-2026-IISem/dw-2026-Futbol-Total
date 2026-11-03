import { Component, input } from '@angular/core';

@Component({
  standalone: true,
  imports: [],
  selector: 'app-empty-state',
  styleUrl: './empty-state.css',
  templateUrl: './empty-state.html',
})
export class EmptyState {
  readonly title = input('Sin resultados');
  readonly message = input.required<string>();
}
