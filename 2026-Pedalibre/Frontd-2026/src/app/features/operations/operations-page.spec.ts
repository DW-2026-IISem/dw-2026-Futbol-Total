import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { environment } from '../../../environments/environment';
import { SessionStore } from '../../core/services/session-store';
import { OperationsPage } from './operations-page';

describe('OperationsPage', () => {
  let http: HttpTestingController;
  let routerMock: { navigate: ReturnType<typeof vi.fn> };
  let sessionMock: { canPermission: () => boolean; isAdminAccount: () => boolean };
  let routeMock: {
    snapshot: {
      data: Record<string, unknown>;
      queryParamMap: { get: (key: string) => string | null };
    };
  };

  beforeEach(() => {
    routerMock = { navigate: vi.fn() };
    sessionMock = { canPermission: () => true, isAdminAccount: () => false };
    routeMock = {
      snapshot: { data: { workflow: 'rentals' }, queryParamMap: { get: () => null } },
    };
    TestBed.configureTestingModule({
      imports: [OperationsPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: SessionStore, useValue: sessionMock },
        { provide: Router, useValue: routerMock },
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('only starts paid reservations and submits no station or rate ID', () => {
    const fixture = TestBed.createComponent(OperationsPage);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    http.expectOne(`${environment.apiUrl}/rentals`).flush({ items: [] });
    http.expectOne(`${environment.apiUrl}/reservations`).flush({
      items: [
        { id: 11, status: 'pending', reservation_payments: [{ status: 'pending' }] },
        {
          id: 12,
          status: 'pending',
          reservation_payments: [{ status: 'successful' }],
          client: { id: 4, first_name: 'Ada', last_name: 'Lovelace' },
          bicycle: { id: 8, serial_number: 'B-008', bicycle_type: 'electric' },
        },
      ],
    });
    fixture.detectChanges();

    expect(component.pendingReservations().map((reservation) => reservation.id)).toEqual([12]);
    component.openStartForReservation(component.pendingReservations()[0]);
    component.execute();

    const start = http.expectOne(`${environment.apiUrl}/rentals/start`);
    expect(start.request.method).toBe('POST');
    expect(start.request.body).toEqual({ reservation_id: 12 });
    start.flush({ rental: { id: 21, status: 'active' } });

    http.expectOne(`${environment.apiUrl}/rentals`).flush({ items: [] });
    http.expectOne(`${environment.apiUrl}/reservations`).flush({ items: [] });
  });

  it('filters rentals by reservation and exposes admin links to related records', () => {
    routeMock.snapshot.queryParamMap.get = (key) => key === 'reservation_id' ? '12' : null;
    sessionMock.isAdminAccount = () => true;
    const component = TestBed.createComponent(OperationsPage).componentInstance;
    component.rows.set([
      { id: 21, reservation_id: 12 },
      { id: 22, reservation_id: 13 },
    ]);

    expect(component.visibleRows().map((row) => row.id)).toEqual([21]);
    component.openRentalRelatedPage('payments', component.visibleRows()[0]);
    expect(routerMock.navigate).toHaveBeenCalledWith(
      ['/payments'],
      { queryParams: { reservation_id: 12 } },
    );
    component.openRentalRelatedPage('penalties', component.visibleRows()[0]);
    expect(routerMock.navigate).toHaveBeenLastCalledWith(
      ['/penalties'],
      { queryParams: { reference_id: 21 } },
    );
  });
});
