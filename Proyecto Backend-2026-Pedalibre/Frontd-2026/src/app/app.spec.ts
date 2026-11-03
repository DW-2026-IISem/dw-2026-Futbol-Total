import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show the PedalLibre landing page without claiming API integration', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const content = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(content).toContain('PedalLibre');
    expect(content).toContain('Integración con la API pendiente');
  });
});
