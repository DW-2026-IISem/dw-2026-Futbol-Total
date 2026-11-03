import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { EmptyState } from './empty-state';

@Component({
  standalone: true,
  imports: [EmptyState],
  template: `
    <app-empty-state message="No hay clientes para mostrar.">
      <button emptyStateAction type="button">Crear cliente</button>
    </app-empty-state>
  `,
})
class EmptyStateHost {}

describe('EmptyState', () => {
  it('renders the provided title and message', async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyState],
    }).compileComponents();
    const fixture = TestBed.createComponent(EmptyState);
    fixture.componentRef.setInput('message', 'No hay clientes para mostrar.');
    fixture.detectChanges();

    const content = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(content).toContain('Sin resultados');
    expect(content).toContain('No hay clientes para mostrar.');
  });

  it('projects a recovery action', async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateHost],
    }).compileComponents();
    const fixture = TestBed.createComponent(EmptyStateHost);
    fixture.detectChanges();

    expect(
      (fixture.nativeElement as HTMLElement).textContent,
    ).toContain('Crear cliente');
  });
});
