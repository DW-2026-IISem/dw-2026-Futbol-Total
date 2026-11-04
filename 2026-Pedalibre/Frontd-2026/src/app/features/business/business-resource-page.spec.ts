import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { environment } from '../../../environments/environment';
import { SessionStore } from '../../core/services/session-store';
import { BusinessResourcePage } from './business-resource-page';

describe('BusinessResourcePage', () => {
  let http: HttpTestingController;
  let sessionMock: {
    canPermission: (permission: string) => boolean;
    isClientAccount: () => boolean;
    isAdminAccount: () => boolean;
  };
  let routerMock: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    sessionMock = {
      canPermission: () => true,
      isClientAccount: () => false,
      isAdminAccount: () => false,
    };
    routerMock = { navigate: vi.fn() };
    TestBed.configureTestingModule({
      imports: [BusinessResourcePage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { data: { resource: 'stations' }, queryParamMap: { get: () => null } } },
        },
        { provide: SessionStore, useValue: sessionMock },
        { provide: Router, useValue: routerMock },
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('requires station names and rejects negative capacity before sending HTTP', () => {
    const component = TestBed.createComponent(BusinessResourcePage).componentInstance;
    component.draft.set({ name: '', description: '', address: '', capacity: '-1', status: '', is_active: true });
    component.save();
    expect(component.formError()).toBe('Nombre es obligatorio.');
    http.expectNone(`${environment.apiUrl}/stations`);

    component.draft.set({ name: 'Centro', description: '', address: '', capacity: '-1', status: '', is_active: true });
    component.save();
    expect(component.formError()).toBe('Capacidad debe ser un valor numérico válido.');
    http.expectNone(`${environment.apiUrl}/stations`);
  });

  it('sends a numeric station ID when creating a docking point', () => {
    const route = TestBed.inject(ActivatedRoute);
    route.snapshot.data['resource'] = 'docking-points';
    const component = TestBed.createComponent(BusinessResourcePage).componentInstance;
    component.draft.set({
      station_id: '9',
      code: 'A-1',
      name: 'Anclaje 1',
      description: '',
      status: '',
      is_active: true,
    });
    component.save();
    const request = http.expectOne(`${environment.apiUrl}/docking-points`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      station_id: 9,
      code: 'A-1',
      name: 'Anclaje 1',
      is_active: true,
    });
    request.flush({ item: { id: 3, station_id: 9, name: 'Anclaje 1' } });
    http.expectOne(`${environment.apiUrl}/docking-points`).flush({ items: [] });
  });

  it('rejects invalid rate calculation rules and reservation time ranges', () => {
    const route = TestBed.inject(ActivatedRoute);
    route.snapshot.data['resource'] = 'rates';
    const rate = TestBed.createComponent(BusinessResourcePage).componentInstance;
    rate.draft.set({
      name: 'Tarifa',
      calculation_rule: 'minute',
      base_value: '10',
      valid_from: '',
      valid_until: '',
      is_active: true,
    });
    rate.save();
    expect(rate.formError()).toBe('El tipo de tarifa debe ser fija, por hora o por día.');

    route.snapshot.data['resource'] = 'reservations';
    const reservation = TestBed.createComponent(BusinessResourcePage).componentInstance;
    reservation.draft.set({
      client_id: '2',
      bicycle_id: '3',
      station_id: '',
      start_at: '2026-11-04T11:00',
      end_at: '2026-11-04T10:00',
      observations: '',
    });
    reservation.save();
    expect(reservation.formError()).toBe('La fecha de fin debe ser posterior a la fecha de inicio.');
    http.expectNone(`${environment.apiUrl}/rates`);
    http.expectNone(`${environment.apiUrl}/reservations`);
  });

  it('requires client_id for staff', () => {
    const route = TestBed.inject(ActivatedRoute);
    route.snapshot.data['resource'] = 'reservations';
    const staffReservation = TestBed.createComponent(BusinessResourcePage).componentInstance;
    staffReservation.draft.set({
      client_id: '',
      bicycle_id: '',
      station_id: '',
      start_at: '2026-11-04T10:00',
      end_at: '2026-11-04T11:00',
      observations: '',
    });
    staffReservation.save();
    expect(staffReservation.formError()).toBe('Cliente es obligatorio.');
    http.expectNone(`${environment.apiUrl}/reservations`);
  });

  it('hides the client field and skips unauthorized reservation catalogs for CLIENTE', () => {
    const route = TestBed.inject(ActivatedRoute);
    route.snapshot.data['resource'] = 'reservations';
    sessionMock.isClientAccount = () => true;
    sessionMock.canPermission = (permission: string) =>
      permission === 'GET /api/bicycles/available' ||
      permission === 'POST /api/reservations' ||
      permission === 'PATCH /api/reservations/:id';
    const fixture = TestBed.createComponent(BusinessResourcePage);
    fixture.detectChanges();
    const clientReservation = fixture.componentInstance;
    http.expectOne(`${environment.apiUrl}/reservations`).flush({
      items: [{ id: 11, client_id: 42, bicycle_id: 8, station_id: 43 }],
    });
    http.expectOne(`${environment.apiUrl}/bicycles/available`).flush({
      bicycles: [{ id: 8, serial_number: 'B-008' }],
    });
    http.expectNone(`${environment.apiUrl}/clientes`);
    http.expectNone(`${environment.apiUrl}/stations`);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('select[aria-label="Cliente"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('select[aria-label="Estación"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('select[aria-label="Bicicleta"]')).not.toBeNull();
    const rowText = fixture.nativeElement.querySelector('tbody')?.textContent ?? '';
    expect(rowText).not.toContain('42');
    expect(rowText).not.toContain('43');

    clientReservation.draft.set({
      client_id: '',
      bicycle_id: '8',
      station_id: '',
      start_at: '2026-11-04T10:00',
      end_at: '2026-11-04T11:00',
      observations: '',
    });
    clientReservation.save();
    const request = http.expectOne(`${environment.apiUrl}/reservations`);
    expect(request.request.body).not.toHaveProperty('client_id');
    request.flush({ item: { id: 11, status: 'pending' } });
    http.expectOne(`${environment.apiUrl}/reservations`).flush({ items: [] });
  });

  it('loads reservation catalogs and renders readable labels while submitting numeric IDs', () => {
    const route = TestBed.inject(ActivatedRoute);
    route.snapshot.data['resource'] = 'reservations';
    const fixture = TestBed.createComponent(BusinessResourcePage);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    http.expectOne(`${environment.apiUrl}/reservations`).flush({
      items: [{
        id: 11,
        client_id: 4,
        bicycle_id: 7,
        station_id: 9,
        start_at: '2026-11-04T10:00:00.000Z',
        end_at: '2026-11-04T11:00:00.000Z',
      }],
    });

    http.expectOne(`${environment.apiUrl}/clientes`).flush({
      clients: [{
        id: 4,
        first_name: 'Ada',
        last_name: 'Lovelace',
        document_number: 'DOC-4',
      }],
    });
    http.expectOne(`${environment.apiUrl}/bicycles/available`).flush({
      bicycles: [{ id: 7, serial_number: 'B-007', bicycle_type: 'standard' }],
    });
    http.expectOne(`${environment.apiUrl}/stations`).flush({
      items: [{ id: 9, name: 'Centro' }],
    });
    fixture.detectChanges();

    const rowText = fixture.nativeElement.querySelector('tbody')?.textContent ?? '';
    expect(rowText).toContain('Ada Lovelace (DOC-4)');
    expect(rowText).toContain('B-007');
    expect(rowText).toContain('Centro');
    expect(component.displayField(component.rows()[0], component.fields[0])).toBe('Ada Lovelace (DOC-4)');

    const clientSelect = fixture.nativeElement.querySelector('select[aria-label="Cliente"]') as HTMLSelectElement;
    const bicycleSelect = fixture.nativeElement.querySelector('select[aria-label="Bicicleta"]') as HTMLSelectElement;
    const stationSelect = fixture.nativeElement.querySelector('select[aria-label="Estación"]') as HTMLSelectElement;
    expect(Array.from(clientSelect.options).map((option) => [option.value, option.textContent?.trim()])).toContainEqual([
      '4',
      'Ada Lovelace (DOC-4)',
    ]);
    expect(Array.from(bicycleSelect.options).map((option) => [option.value, option.textContent?.trim()])).toContainEqual([
      '7',
      'B-007 · Estándar',
    ]);
    expect(Array.from(stationSelect.options).map((option) => [option.value, option.textContent?.trim()])).toContainEqual([
      '9',
      'Centro',
    ]);

    for (const [select, value] of [[clientSelect, '4'], [bicycleSelect, '7'], [stationSelect, '9']] as const) {
      select.value = value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
    component.draft.update((draft) => ({
      ...draft,
      start_at: '2026-11-04T10:00',
      end_at: '2026-11-04T11:00',
    }));
    component.save();
    const request = http.expectOne(`${environment.apiUrl}/reservations`);
    expect(request.request.body).toMatchObject({ client_id: 4, bicycle_id: 7, station_id: 9 });
    expect(typeof request.request.body.client_id).toBe('number');
    expect(typeof request.request.body.bicycle_id).toBe('number');
    expect(typeof request.request.body.station_id).toBe('number');
    request.flush({ item: { id: 12 } });
    http.expectOne(`${environment.apiUrl}/reservations`).flush({ items: [] });
  });

  it('shows reservation progress in observations without losing customer notes', () => {
    const route = TestBed.inject(ActivatedRoute);
    route.snapshot.data['resource'] = 'reservations';
    const component = TestBed.createComponent(BusinessResourcePage).componentInstance;
    const observationsField = component.fields.find((field) => field.key === 'observations');
    if (!observationsField) throw new Error('El campo de observaciones debe estar configurado para reservas.');

    expect(component.displayField({
      id: 1,
      status: 'pending',
      observations: '',
      reservation_payments: [{ id: 12, status: 'successful' }],
    }, observationsField)).toBe('Pago exitoso');

    expect(component.displayField({
      id: 2,
      status: 'in_progress',
      observations: 'Entrega confirmada',
    }, observationsField)).toBe('En curso · Entrega confirmada');

    expect(component.displayField({
      id: 3,
      status: 'completed',
      observations: '',
    }, observationsField)).toBe('Finalizado');

    expect(component.displayField({
      id: 4,
      status: 'pending',
      observations: '',
      reservation_payments: [{ id: 13, status: 'pending' }],
    }, observationsField)).toBe('Pendiente de pago');
  });

  it('filters linked payments by reservation and navigates to related resources', () => {
    const route = TestBed.inject(ActivatedRoute);
    route.snapshot.data['resource'] = 'payments';
    route.snapshot.queryParamMap.get = (key: string) => key === 'reservation_id' ? '42' : null;
    sessionMock.isAdminAccount = () => true;
    const component = TestBed.createComponent(BusinessResourcePage).componentInstance;
    component.rows.set([
      { id: 1, reservation_id: 42, reference_id: null },
      { id: 2, reservation_id: 43, reference_id: null },
    ]);

    expect(component.visibleRows().map((row) => row.id)).toEqual([1]);
    component.openRelatedPage('rentals', { reservation_id: 42 });
    expect(routerMock.navigate).toHaveBeenCalledWith(
      ['/rentals'],
      { queryParams: { reservation_id: 42 } },
    );
  });

  it('registers a reservation prepayment without sending the calculated amount or date', () => {
    const route = TestBed.inject(ActivatedRoute);
    route.snapshot.data['resource'] = 'payments';
    const fixture = TestBed.createComponent(BusinessResourcePage);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    http.expectOne(`${environment.apiUrl}/payments`).flush({ items: [] });
    http.expectOne(`${environment.apiUrl}/reservations`).flush({
      items: [{
        id: 21,
        client_id: 8,
        bicycle_id: 14,
        start_at: '2026-11-04T10:00:00.000Z',
        end_at: '2026-11-04T11:00:00.000Z',
        status: 'pending',
        client: { id: 8, first_name: 'Ada', last_name: 'Lovelace' },
        bicycle: { id: 14, serial_number: 'B-014', bicycle_type: 'standard' },
      }],
    });
    http.expectOne(`${environment.apiUrl}/rates`).flush({
      items: [{
        id: 4,
        name: 'Alquiler por hora - Bicicleta estándar',
        calculation_rule: 'hourly',
        base_value: '18000.00',
        is_active: true,
      }],
    });
    fixture.detectChanges();

    expect(component.eligiblePaymentReservations().map((reservation) => reservation.id)).toEqual([21]);
    component.paymentDraft.set({
      reservation_id: '21',
      rate_id: '4',
      method: 'transfer',
      transaction_code: 'TX-ABC-123',
      status: 'pending',
    });
    component.registerPayment();

    const request = http.expectOne(`${environment.apiUrl}/payments`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      reservation_id: 21,
      rate_id: 4,
      method: 'transfer',
      transaction_code: 'TX-ABC-123',
      status: 'pending',
    });
    expect(request.request.body).not.toHaveProperty('amount');
    expect(request.request.body).not.toHaveProperty('payment_date');
    request.flush({ item: { id: 31, reservation_id: 21, status: 'pending' } });
    http.expectOne(`${environment.apiUrl}/payments`).flush({ items: [] });
    http.expectOne(`${environment.apiUrl}/reservations`).flush({ items: [] });
    http.expectOne(`${environment.apiUrl}/rates`).flush({ items: [] });
  });

  it('shows a clear error if an authorized reservation catalog cannot be loaded', () => {
    const route = TestBed.inject(ActivatedRoute);
    route.snapshot.data['resource'] = 'reservations';
    const fixture = TestBed.createComponent(BusinessResourcePage);
    fixture.detectChanges();

    http.expectOne(`${environment.apiUrl}/reservations`).flush({ items: [] });
    http.expectOne(`${environment.apiUrl}/clientes`).flush({
      clients: [{ id: 4, first_name: 'Ada', last_name: 'Lovelace' }],
    });
    http.expectOne(`${environment.apiUrl}/bicycles/available`).error(new ProgressEvent('error'));
    http.expectOne(`${environment.apiUrl}/stations`).flush({ items: [] });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'No se pudo cargar el catálogo de bicicletas disponibles: No se pudo conectar con el servidor de PedalLibre.',
    );
    expect(fixture.componentInstance.availableBicycles()).toEqual([]);
  });

  it('loads station and docking-point records and expands anchors under their station', () => {
    const route = TestBed.inject(ActivatedRoute);
    route.snapshot.data['resource'] = 'stations';
    const fixture = TestBed.createComponent(BusinessResourcePage);
    fixture.detectChanges();

    http.expectOne(`${environment.apiUrl}/stations`).flush({
      items: [{ id: 5, name: 'Malecón', address: 'Calle 1', capacity: 20 }],
    });
    http.expectOne(`${environment.apiUrl}/docking-points`).flush({
      items: [
        { id: 51, station_id: 5, code: 'RIO-02-P01', name: 'Anclaje 1', status: 'occupied', is_active: true },
        { id: 52, station_id: 8, code: 'RIO-03-P01', name: 'Anclaje 1', status: 'available', is_active: true },
      ],
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('1 anclaje');
    fixture.componentInstance.toggleStation(5);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('RIO-02-P01');
    expect(fixture.nativeElement.textContent).toContain('Ocupado');
    expect(fixture.nativeElement.textContent).not.toContain('RIO-03-P01');
  });

  it('uses station names in the docking-point form and table', () => {
    const route = TestBed.inject(ActivatedRoute);
    route.snapshot.data['resource'] = 'docking-points';
    const fixture = TestBed.createComponent(BusinessResourcePage);
    fixture.detectChanges();

    http.expectOne(`${environment.apiUrl}/docking-points`).flush({
      items: [{ id: 3, station_id: 9, code: 'RIO-01-P01', name: 'Anclaje RIO-01-P01' }],
    });
    http.expectOne(`${environment.apiUrl}/stations`).flush({
      items: [{ id: 9, name: 'Plaza Padilla' }],
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Plaza Padilla');
    fixture.componentInstance.startCreate();
    fixture.detectChanges();
    const stationSelect = fixture.nativeElement.querySelector('select[aria-label="Estación"]') as HTMLSelectElement;
    expect(Array.from(stationSelect.options).map((option) => [option.value, option.textContent?.trim()])).toContainEqual([
      '9',
      'Plaza Padilla',
    ]);
  });

  it('displays saved hourly rates formatted as Colombian pesos', () => {
    const route = TestBed.inject(ActivatedRoute);
    route.snapshot.data['resource'] = 'rates';
    const fixture = TestBed.createComponent(BusinessResourcePage);
    fixture.detectChanges();
    http.expectOne(`${environment.apiUrl}/rates`).flush({
      items: [
        { id: 1, name: 'Alquiler por hora - Bicicleta estándar', calculation_rule: 'hourly', base_value: '15000' },
        { id: 2, name: 'Alquiler por hora - Bicicleta eléctrica', calculation_rule: 'hourly', base_value: '20000' },
      ],
    });
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Alquiler por hora - Bicicleta estándar');
    expect(text).toContain('Alquiler por hora - Bicicleta eléctrica');
    expect(text).toContain('15.000');
    expect(text).toContain('20.000');
  });
});
