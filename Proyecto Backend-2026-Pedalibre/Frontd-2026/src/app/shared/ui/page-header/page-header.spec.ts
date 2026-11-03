import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PageHeader } from './page-header';

@Component({
  standalone: true,
  imports: [PageHeader],
  template: `
    <app-page-header title="Clientes">
      <button pageHeaderActions type="button">Agregar cliente</button>
    </app-page-header>
  `,
})
class PageHeaderHost {}

describe('PageHeader', () => {
  it('renders the title and optional description', async () => {
    await TestBed.configureTestingModule({
      imports: [PageHeader],
    }).compileComponents();
    const fixture = TestBed.createComponent(PageHeader);
    fixture.componentRef.setInput('title', 'Clientes');
    fixture.componentRef.setInput('description', 'Administra clientes de PedalLibre');
    fixture.detectChanges();

    const content = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(content).toContain('Clientes');
    expect(content).toContain('Administra clientes de PedalLibre');
  });

  it('projects page actions', async () => {
    await TestBed.configureTestingModule({
      imports: [PageHeaderHost],
    }).compileComponents();
    const fixture = TestBed.createComponent(PageHeaderHost);
    fixture.detectChanges();

    expect(
      (fixture.nativeElement as HTMLElement).textContent,
    ).toContain('Agregar cliente');
  });
});
