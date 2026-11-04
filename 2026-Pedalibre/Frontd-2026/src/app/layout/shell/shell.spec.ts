import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { MessageService } from 'primeng/api';
import { Aside } from '../aside/aside';
import { Shell } from './shell';

describe('Shell', () => {
  let component: Shell;
  let fixture: ComponentFixture<Shell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Shell],
      providers: [provideRouter([]), provideHttpClient(), MessageService],
    }).compileComponents();

    fixture = TestBed.createComponent(Shell);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('toggles the menu and updates its accessible expanded state', () => {
    const menuButton = fixture.nativeElement.querySelector(
      'app-header button',
    ) as HTMLButtonElement;

    expect(menuButton.getAttribute('aria-controls')).toBe('app-navigation');
    expect(
      fixture.nativeElement.querySelector('#app-navigation'),
    ).not.toBeNull();
    expect(menuButton.getAttribute('aria-expanded')).toBe('false');
    menuButton.click();
    fixture.detectChanges();

    expect(component.menuExpanded()).toBe(true);
    expect(menuButton.getAttribute('aria-expanded')).toBe('true');
    expect(
      fixture.nativeElement.querySelector(
        'button[aria-label="Cerrar menú de navegación"]',
      ),
    ).not.toBeNull();
  });

  it('closes the menu when the overlay is clicked', () => {
    component.toggleMenu();
    fixture.detectChanges();

    const overlay = fixture.nativeElement.querySelector(
      'button[aria-label="Cerrar menú de navegación"]',
    ) as HTMLButtonElement;
    overlay.click();
    fixture.detectChanges();

    expect(component.menuExpanded()).toBe(false);
    expect(
      fixture.nativeElement.querySelector(
        'button[aria-label="Cerrar menú de navegación"]',
      ),
    ).toBeNull();
  });

  it('closes the menu after the Aside emits a navigation event', () => {
    component.toggleMenu();
    fixture.detectChanges();

    fixture.debugElement
      .query(By.directive(Aside))
      .triggerEventHandler('navigate');
    fixture.detectChanges();

    expect(component.menuExpanded()).toBe(false);
  });
});
