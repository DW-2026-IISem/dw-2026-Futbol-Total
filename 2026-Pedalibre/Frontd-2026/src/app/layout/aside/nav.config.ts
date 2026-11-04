export interface NavigationItem {
  path: string;
  label: string;
  icon: string;
  permission?: string;
}

export const navigationItems: NavigationItem[] = [
  { path: '/dashboard', label: 'Resumen', icon: 'pi-home', permission: 'GET /api/bicycles/available' },
  { path: '/clientes', label: 'Clientes', icon: 'pi-users', permission: 'GET /api/clientes' },
  { path: '/stations', label: 'Estaciones', icon: 'pi-map-marker', permission: 'GET /api/stations' },
  { path: '/docking-points', label: 'Puntos de anclaje', icon: 'pi-map', permission: 'GET /api/docking-points' },
  { path: '/bicycles', label: 'Bicicletas', icon: 'pi-directions', permission: 'GET /api/bicycles' },
  { path: '/bicycle-dockings', label: 'Movimientos', icon: 'pi-sync', permission: 'GET /api/bicycle-dockings' },
  { path: '/rates', label: 'Tarifas', icon: 'pi-tag', permission: 'GET /api/rates' },
  { path: '/reservations', label: 'Reservas', icon: 'pi-calendar', permission: 'GET /api/reservations' },
  { path: '/rentals', label: 'Alquileres', icon: 'pi-clock', permission: 'GET /api/rentals' },
  { path: '/rental-events', label: 'Eventos', icon: 'pi-history', permission: 'GET /api/rental-events' },
  { path: '/maintenances', label: 'Mantenimientos', icon: 'pi-wrench', permission: 'GET /api/maintenances' },
  { path: '/penalties', label: 'Penalidades', icon: 'pi-exclamation-circle', permission: 'GET /api/penalties' },
  { path: '/payments', label: 'Pagos', icon: 'pi-wallet', permission: 'GET /api/payments' },
  { path: '/admin/users', label: 'Usuarios', icon: 'pi-user-edit', permission: 'GET /api/usuarios' },
  { path: '/admin/roles', label: 'Roles', icon: 'pi-id-card', permission: 'GET /api/roles' },
  { path: '/admin/resources', label: 'Recursos', icon: 'pi-server', permission: 'GET /api/recursos' },
  { path: '/admin/grants', label: 'Concesiones', icon: 'pi-key', permission: 'GET /api/concesiones-rol' },
  { path: '/profile', label: 'Mi perfil', icon: 'pi-user' },
];
