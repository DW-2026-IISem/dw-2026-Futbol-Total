import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { StatusTag } from './status-tag';

describe('StatusTag', () => {
  it('renders a neutral PrimeNG tag when no severity is mapped', async () => {
    await TestBed.configureTestingModule({
      imports: [StatusTag],
    }).compileComponents();
    const fixture = TestBed.createComponent(StatusTag);
    fixture.componentRef.setInput('value', 'Pendiente');
    fixture.detectChanges();

    const tag = (fixture.nativeElement as HTMLElement).querySelector('p-tag');
    expect(tag).not.toBeNull();
    expect(tag?.classList.contains('p-tag-secondary')).toBe(true);
    expect(tag?.textContent).toContain('Pendiente');
  });

  it('accepts a feature-specific severity', async () => {
    await TestBed.configureTestingModule({
      imports: [StatusTag],
    }).compileComponents();
    const fixture = TestBed.createComponent(StatusTag);
    fixture.componentRef.setInput('value', 'Activo');
    fixture.componentRef.setInput('severity', 'success');
    fixture.detectChanges();

    const tag = (fixture.nativeElement as HTMLElement).querySelector('p-tag');
    expect(tag?.classList.contains('p-tag-success')).toBe(true);
  });
});
