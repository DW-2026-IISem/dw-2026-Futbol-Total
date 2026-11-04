import {
  ApplicationConfig,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth-interceptor';
import { environment } from '../environments/environment';

registerLocaleData(localeEs, 'es-CO');

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'es-CO' },
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    MessageService,
    providePrimeNG({
      license: environment.primeUiLicense,
      ripple: true,
      translation: {
        accept: 'Aceptar',
        reject: 'Rechazar',
        choose: 'Elegir',
        upload: 'Cargar',
        cancel: 'Cancelar',
        clear: 'Limpiar',
        apply: 'Aplicar',
        matchAll: 'Coincidir con todas',
        matchAny: 'Coincidir con alguna',
        addRule: 'Agregar condición',
        removeRule: 'Eliminar condición',
        startsWith: 'Comienza con',
        contains: 'Contiene',
        notContains: 'No contiene',
        endsWith: 'Termina con',
        equals: 'Igual a',
        notEquals: 'Distinto de',
        noFilter: 'Sin filtro',
        lt: 'Menor que',
        lte: 'Menor o igual que',
        gt: 'Mayor que',
        gte: 'Mayor o igual que',
        before: 'Antes de',
        after: 'Después de',
        dateIs: 'La fecha es',
        dateIsNot: 'La fecha no es',
        dateBefore: 'Fecha anterior a',
        dateAfter: 'Fecha posterior a',
        today: 'Hoy',
        weekHeader: 'Sem.',
        dayNames: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
        dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
        dayNamesMin: ['do', 'lu', 'ma', 'mi', 'ju', 'vi', 'sá'],
        monthNames: [
          'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
          'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
        ],
        monthNamesShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
        dateFormat: 'dd/mm/yy',
        firstDayOfWeek: 1,
        emptyMessage: 'No hay opciones disponibles',
        emptyFilterMessage: 'No se encontraron resultados',
        emptySelectionMessage: 'No hay elementos seleccionados',
        emptySearchMessage: 'No se encontraron resultados',
        searchMessage: 'Hay {0} resultados disponibles',
        selectionMessage: '{0} elementos seleccionados',
        aria: {
          trueLabel: 'Verdadero',
          falseLabel: 'Falso',
          nullLabel: 'Sin selección',
          close: 'Cerrar',
          previous: 'Anterior',
          next: 'Siguiente',
          navigation: 'Navegación',
          firstPageLabel: 'Primera página',
          lastPageLabel: 'Última página',
          nextPageLabel: 'Página siguiente',
          prevPageLabel: 'Página anterior',
          rowsPerPageLabel: 'Filas por página',
          pageLabel: 'Página',
          selectRow: 'Seleccionar fila',
          unselectRow: 'Quitar selección de fila',
          expandRow: 'Expandir fila',
          collapseRow: 'Contraer fila',
          filter: 'Filtrar',
        },
      },
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.app-dark',
          cssLayer: {
            name: 'primeng',
            order: 'theme, base, primeng, utilities',
          },
        },
      },
    }),
  ],
};