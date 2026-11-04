import { Routes } from '@angular/router';
import { authGuard, guestGuard, permissionGuard } from './core/guards/session-guards';

const localizedRouteTitles: Record<string, string> = {
  stations: 'Estaciones',
  'docking-points': 'Puntos de anclaje',
  bicycles: 'Bicicletas',
  rates: 'Tarifas',
  reservations: 'Reservas',
  maintenances: 'Mantenimientos',
  penalties: 'Penalidades',
  payments: 'Pagos',
  'bicycle-dockings': 'Movimientos de anclaje',
  rentals: 'Alquileres',
  'rental-events': 'Eventos de alquiler',
  'admin/users': 'Usuarios',
  'admin/roles': 'Roles',
  'admin/resources': 'Recursos',
  'admin/grants': 'Permisos por rol',
};

const businessRoutes: Routes = [
  ['stations', 'GET /api/stations'],
  ['docking-points', 'GET /api/docking-points'],
  ['bicycles', 'GET /api/bicycles'],
  ['rates', 'GET /api/rates'],
  ['reservations', 'GET /api/reservations'],
  ['maintenances', 'GET /api/maintenances'],
  ['penalties', 'GET /api/penalties'],
  ['payments', 'GET /api/payments'],
].map(([path, permission]) => ({
  path,
  title: `${localizedRouteTitles[path]} · PedalLibre`,
  canActivate: [permissionGuard],
  data: { permission, resource: path },
  loadComponent: () =>
    import('./features/business/business-resource-page').then(
      (module) => module.BusinessResourcePage,
    ),
}));

const workflowRoutes: Routes = [
  ['bicycle-dockings', 'GET /api/bicycle-dockings', 'dockings'],
  ['rentals', 'GET /api/rentals', 'rentals'],
  ['rental-events', 'GET /api/rental-events', 'events'],
].map(([path, permission, workflow]) => ({
  path,
  title: `${localizedRouteTitles[path]} · PedalLibre`,
  canActivate: [permissionGuard],
  data: { permission, workflow },
  loadComponent: () =>
    import('./features/operations/operations-page').then((module) => module.OperationsPage),
}));

const adminRoutes: Routes = [
  ['admin/users', 'GET /api/usuarios', 'users'],
  ['admin/roles', 'GET /api/roles', 'roles'],
  ['admin/resources', 'GET /api/recursos', 'resources'],
  ['admin/grants', 'GET /api/concesiones-rol', 'grants'],
].map(([path, permission, adminSection]) => ({
  path,
  title: `${localizedRouteTitles[path]} · PedalLibre`,
  canActivate: [permissionGuard],
  data: { permission, adminSection },
  loadComponent: () =>
    import('./features/admin/admin-page').then((module) => module.AdminPage),
}));

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'PedalLibre · Movilidad compartida en Riohacha',
    loadComponent: () =>
      import('./features/home/home-page/home-page').then((module) => module.HomePage),
  },
  {
    path: 'login',
    title: 'Iniciar sesión · PedalLibre',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login-page').then((module) => module.LoginPage),
  },
  {
    path: 'register',
    title: 'Crear cuenta · PedalLibre',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/register-page').then((module) => module.RegisterPage),
  },
  {
    path: 'forbidden',
    title: 'Acceso no autorizado · PedalLibre',
    loadComponent: () =>
      import('./features/auth/forbidden-page').then((module) => module.ForbiddenPage),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/shell/shell').then((module) => module.Shell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: 'Resumen operativo · PedalLibre',
        canActivate: [permissionGuard],
        data: { permission: 'GET /api/bicycles/available' },
        loadComponent: () =>
          import('./features/dashboard/dashboard-page').then((module) => module.DashboardPage),
      },
      {
        path: 'clientes',
        title: 'Clientes · PedalLibre',
        canActivate: [permissionGuard],
        data: { permission: 'GET /api/clientes' },
        loadComponent: () =>
          import('./features/clients/client-list/client-list').then(
            (module) => module.ClientList,
          ),
      },
      {
        path: 'profile',
        title: 'Mi perfil · PedalLibre',
        loadComponent: () =>
          import('./features/auth/profile-page').then((module) => module.ProfilePage),
      },
      ...businessRoutes,
      ...workflowRoutes,
      ...adminRoutes,
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
