const statusLabels: Record<string, string> = {
  active: 'Activo',
  available: 'Disponible',
  cancelled: 'Cancelada',
  canceled: 'Cancelada',
  closed: 'Cerrado',
  completed: 'Finalizado',
  confirmed: 'Confirmado',
  expired: 'Vencida',
  failed: 'Fallido',
  fixed: 'Tarifa fija',
  hourly: 'Por hora',
  in_progress: 'En curso',
  maintenance: 'En mantenimiento',
  occupied: 'Ocupado',
  paid: 'Pagado',
  pending: 'Pendiente',
  rented: 'Alquilada',
  scheduled: 'Programado',
  standard: 'Estándar',
  successful: 'Exitoso',
  transfer: 'Transferencia',
  cash: 'Efectivo',
  daily: 'Por día',
  unavailable: 'No disponible',
  electric: 'Eléctrica',
  mechanical: 'Mecánica',
  rental_started: 'Alquiler iniciado',
  rental_finished: 'Alquiler finalizado',
  docked: 'Bicicleta anclada',
  undocked: 'Bicicleta desanclada',
  penalty_created: 'Penalidad generada',
};

const columnLabels: Record<string, string> = {
  id: 'Identificador',
  user_id: 'Usuario',
  reservation_id: 'Reserva',
  client_id: 'Cliente',
  bicycle_id: 'Bicicleta',
  rate_id: 'Tarifa',
  start_station_id: 'Estación de inicio',
  end_station_id: 'Estación de devolución',
  start_at: 'Hora de inicio',
  end_at: 'Hora de finalización',
  reserved_at: 'Fecha de reserva',
  expires_at: 'Vence el',
  total: 'Total pagado',
  amount: 'Importe',
  status: 'Estado',
  observations: 'Observaciones',
  bicycle: 'Bicicleta',
  client: 'Cliente',
  rate: 'Tarifa',
  station: 'Estación',
  method: 'Método',
  transaction_code: 'Código de transacción',
  payment_date: 'Fecha de pago',
  reference_id: 'Alquiler asociado',
  reference_type: 'Tipo de referencia',
  role_id: 'Identificador del rol',
  resource_id: 'Identificador del recurso',
  resource: 'Recurso',
  role: 'Rol',
  username: 'Usuario',
  email: 'Correo',
  name: 'Nombre',
  description: 'Descripción',
  path: 'Ruta',
  method_http: 'Método HTTP',
  is_active: 'Activo',
  serial_number: 'Número de serie',
  bicycle_type: 'Tipo de bicicleta',
  docking_point_id: 'Punto de anclaje',
  docking_point: 'Punto de anclaje',
  docked_at: 'Fecha de anclaje',
  undocked_at: 'Fecha de desanclaje',
  event_date: 'Fecha del evento',
  type: 'Tipo',
  quantity: 'Cantidad',
  penalty_date: 'Fecha de penalidad',
  scheduled_at: 'Fecha programada',
  closed_at: 'Fecha de cierre',
  cost: 'Costo',
  capacity: 'Capacidad',
  address: 'Dirección',
  code: 'Código',
  created_at: 'Fecha de creación',
  updated_at: 'Última actualización',
  first_name: 'Nombres',
  last_name: 'Apellidos',
  document_type: 'Tipo de documento',
  document_number: 'Número de documento',
  phone: 'Teléfono',
  calculation_rule: 'Tipo de tarifa',
  base_value: 'Valor base',
  valid_from: 'Vigente desde',
  valid_until: 'Vigente hasta',
  permission: 'Permiso',
  role_name: 'Nombre del rol',
  is_allowed: 'Permiso concedido',
};

const dateColumns = new Set([
  'start_at',
  'end_at',
  'reserved_at',
  'expires_at',
  'payment_date',
  'docked_at',
  'undocked_at',
  'event_date',
  'penalty_date',
  'scheduled_at',
  'closed_at',
  'created_at',
  'updated_at',
]);

export function spanishStatus(value: unknown): string {
  const raw = String(value ?? '');
  return statusLabels[raw.toLowerCase()] ?? raw;
}

export function spanishColumn(key: string): string {
  return columnLabels[key] ?? key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toLocaleUpperCase('es-CO'));
}

export function spanishValue(value: unknown, key?: string): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  if (key === 'status' || key === 'method' || key === 'type' || key === 'bicycle_type' || key === 'calculation_rule') {
    return spanishStatus(value);
  }
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function isDateColumn(key: string): boolean {
  return dateColumns.has(key);
}

export function spanishIdentifier(key: string): string {
  return columnLabels[key] ?? spanishColumn(key);
}
