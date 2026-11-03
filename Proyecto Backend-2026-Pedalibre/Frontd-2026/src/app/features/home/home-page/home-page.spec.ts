import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomePage } from './home-page';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows the PedalLibre landing page without claiming API integration', () => {
    const content = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(content).toContain('PedalLibre');
    expect(content).toContain('Integración con la API pendiente');
  });
});
