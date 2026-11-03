import { Component, input } from '@angular/core';

@Component({
  standalone: true,
  imports: [],
  selector: 'app-page-header',
  styleUrl: './page-header.css',
  templateUrl: './page-header.html',
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly description = input('');
}
