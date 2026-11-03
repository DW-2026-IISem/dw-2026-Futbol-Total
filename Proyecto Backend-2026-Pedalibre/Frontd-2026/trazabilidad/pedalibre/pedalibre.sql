-- PedalLibre - schema inicial MySQL 8.0+
-- Seguro para ejecutar varias veces: no elimina bases, tablas ni registros.

CREATE DATABASE IF NOT EXISTS `Proyecto-Pedalibre-DW`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `Proyecto-Pedalibre-DW`;

CREATE TABLE IF NOT EXISTS roles (
  role_id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(40) NOT NULL,
  description TEXT NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (role_id),
  CONSTRAINT uq_roles_name UNIQUE (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS resources (
  resource_id INT NOT NULL AUTO_INCREMENT,
  method VARCHAR(10) NOT NULL,
  path VARCHAR(255) NOT NULL,
  description VARCHAR(255) NOT NULL DEFAULT '',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (resource_id),
  CONSTRAINT uq_resources_method_path UNIQUE (method, path)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS role_resources (
  role_resource_id INT NOT NULL AUTO_INCREMENT,
  role_id INT NOT NULL,
  resource_id INT NOT NULL,
  is_allowed TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (role_resource_id),
  CONSTRAINT uq_role_resources_role_resource UNIQUE (role_id, resource_id),
  CONSTRAINT fk_role_resources_role
    FOREIGN KEY (role_id) REFERENCES roles (role_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_role_resources_resource
    FOREIGN KEY (resource_id) REFERENCES resources (resource_id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
  user_id INT NOT NULL AUTO_INCREMENT,
  role_id INT NOT NULL,
  username VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(150) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  CONSTRAINT uq_users_username UNIQUE (username),
  CONSTRAINT uq_users_email UNIQUE (email),
  KEY ix_users_role_id (role_id),
  CONSTRAINT fk_users_role
    FOREIGN KEY (role_id) REFERENCES roles (role_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS refresh_tokens (
  refresh_token_id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  family_id VARCHAR(100) NOT NULL,
  device_info VARCHAR(500) NULL,
  expires_at DATETIME NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (refresh_token_id),
  CONSTRAINT uq_refresh_tokens_token_hash UNIQUE (token_hash),
  KEY ix_refresh_tokens_family_id (family_id),
  KEY ix_refresh_tokens_user_id (user_id),
  CONSTRAINT fk_refresh_tokens_user
    FOREIGN KEY (user_id) REFERENCES users (user_id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS clients (
  client_id INT NOT NULL AUTO_INCREMENT,
  user_id INT NULL,
  document_type VARCHAR(30) NOT NULL DEFAULT '',
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  document_number VARCHAR(50) NOT NULL,
  phone VARCHAR(30) NULL,
  email VARCHAR(150) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (client_id),
  CONSTRAINT uq_clients_document_number UNIQUE (document_number),
  CONSTRAINT uq_clients_user UNIQUE (user_id),
  KEY ix_clients_name (last_name, first_name),
  CONSTRAINT fk_clients_user
    FOREIGN KEY (user_id) REFERENCES users (user_id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS stations (
  station_id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  description TEXT NOT NULL,
  address VARCHAR(255) NOT NULL DEFAULT '',
  capacity INT UNSIGNED NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (station_id),
  KEY ix_stations_active_name (is_active, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bicycles (
  bicycle_id INT NOT NULL AUTO_INCREMENT,
  serial_number VARCHAR(80) NOT NULL,
  name VARCHAR(120) NOT NULL DEFAULT '',
  description TEXT NOT NULL,
  bicycle_type VARCHAR(50) NOT NULL DEFAULT 'standard',
  status VARCHAR(30) NOT NULL DEFAULT 'available',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (bicycle_id),
  CONSTRAINT uq_bicycles_serial_number UNIQUE (serial_number),
  KEY ix_bicycles_available (is_active, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS docking_points (
  docking_point_id INT NOT NULL AUTO_INCREMENT,
  station_id INT NOT NULL,
  code VARCHAR(30) NULL,
  name VARCHAR(120) NOT NULL DEFAULT '',
  description TEXT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'available',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (docking_point_id),
  CONSTRAINT uq_docking_points_station_code UNIQUE (station_id, code),
  KEY ix_docking_points_status (is_active, status),
  CONSTRAINT fk_docking_points_station
    FOREIGN KEY (station_id) REFERENCES stations (station_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rates (
  rate_id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  calculation_rule VARCHAR(80) NOT NULL,
  base_value DECIMAL(10,2) NOT NULL,
  valid_from DATE NULL,
  valid_until DATE NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (rate_id),
  KEY ix_rates_active_validity (is_active, valid_from, valid_until)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reservations (
  reservation_id INT NOT NULL AUTO_INCREMENT,
  client_id INT NOT NULL,
  bicycle_id INT NULL,
  station_id INT NULL,
  start_at DATETIME NULL,
  end_at DATETIME NULL,
  reserved_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  observations TEXT NOT NULL,
  PRIMARY KEY (reservation_id),
  KEY ix_reservations_client_status (client_id, status),
  KEY ix_reservations_bicycle_window (bicycle_id, start_at, end_at),
  CONSTRAINT fk_reservations_client
    FOREIGN KEY (client_id) REFERENCES clients (client_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_reservations_bicycle
    FOREIGN KEY (bicycle_id) REFERENCES bicycles (bicycle_id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_reservations_station
    FOREIGN KEY (station_id) REFERENCES stations (station_id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rentals (
  rental_id INT NOT NULL AUTO_INCREMENT,
  reservation_id INT NULL,
  client_id INT NOT NULL,
  bicycle_id INT NOT NULL,
  rate_id INT NOT NULL,
  start_station_id INT NULL,
  end_station_id INT NULL,
  start_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  end_at DATETIME NULL,
  total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  observations TEXT NOT NULL,
  active_bicycle_id INT GENERATED ALWAYS AS (
    CASE WHEN status = 'active' THEN bicycle_id ELSE NULL END
  ) STORED,
  PRIMARY KEY (rental_id),
  CONSTRAINT uq_rentals_reservation UNIQUE (reservation_id),
  CONSTRAINT uq_rentals_active_bicycle UNIQUE (active_bicycle_id),
  KEY ix_rentals_client_started (client_id, start_at),
  KEY ix_rentals_bicycle_status (bicycle_id, status),
  CONSTRAINT fk_rentals_reservation
    FOREIGN KEY (reservation_id) REFERENCES reservations (reservation_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_rentals_client
    FOREIGN KEY (client_id) REFERENCES clients (client_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_rentals_bicycle
    FOREIGN KEY (bicycle_id) REFERENCES bicycles (bicycle_id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_rentals_rate
    FOREIGN KEY (rate_id) REFERENCES rates (rate_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_rentals_start_station
    FOREIGN KEY (start_station_id) REFERENCES stations (station_id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_rentals_end_station
    FOREIGN KEY (end_station_id) REFERENCES stations (station_id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rental_events (
  rental_event_id INT NOT NULL AUTO_INCREMENT,
  rental_id INT NOT NULL,
  type VARCHAR(50) NOT NULL,
  event_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  quantity INT UNSIGNED NULL,
  observations TEXT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'confirmed',
  PRIMARY KEY (rental_event_id),
  KEY ix_rental_events_rental_date (rental_id, event_date),
  CONSTRAINT fk_rental_events_rental
    FOREIGN KEY (rental_id) REFERENCES rentals (rental_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bicycle_dockings (
  bicycle_docking_id INT NOT NULL AUTO_INCREMENT,
  bicycle_id INT NOT NULL,
  docking_point_id INT NOT NULL,
  docked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  undocked_at DATETIME NULL,
  active_bicycle_id INT GENERATED ALWAYS AS (
    CASE WHEN undocked_at IS NULL THEN bicycle_id ELSE NULL END
  ) STORED,
  active_docking_point_id INT GENERATED ALWAYS AS (
    CASE WHEN undocked_at IS NULL THEN docking_point_id ELSE NULL END
  ) STORED,
  PRIMARY KEY (bicycle_docking_id),
  CONSTRAINT uq_bicycle_dockings_active_bicycle UNIQUE (active_bicycle_id),
  CONSTRAINT uq_bicycle_dockings_active_point UNIQUE (active_docking_point_id),
  KEY ix_bicycle_dockings_point_history (docking_point_id, docked_at),
  CONSTRAINT fk_bicycle_dockings_bicycle
    FOREIGN KEY (bicycle_id) REFERENCES bicycles (bicycle_id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_bicycle_dockings_point
    FOREIGN KEY (docking_point_id) REFERENCES docking_points (docking_point_id)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS penalties (
  penalty_id INT NOT NULL AUTO_INCREMENT,
  reference_id INT NOT NULL,
  penalty_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  observations TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (penalty_id),
  KEY ix_penalties_rental_status (reference_id, status),
  CONSTRAINT fk_penalties_rental
    FOREIGN KEY (reference_id) REFERENCES rentals (rental_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS maintenances (
  maintenance_id INT NOT NULL AUTO_INCREMENT,
  resource_id INT NOT NULL,
  type VARCHAR(80) NOT NULL,
  scheduled_at DATETIME NOT NULL,
  closed_at DATETIME NULL,
  cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status VARCHAR(30) NOT NULL DEFAULT 'scheduled',
  observations TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (maintenance_id),
  KEY ix_maintenances_resource_status (resource_id, status),
  CONSTRAINT fk_maintenances_bicycle
    FOREIGN KEY (resource_id) REFERENCES bicycles (bicycle_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payments (
  payment_id INT NOT NULL AUTO_INCREMENT,
  reference_type VARCHAR(30) NOT NULL DEFAULT 'RENTAL',
  reference_id INT NOT NULL,
  method VARCHAR(30) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (payment_id),
  KEY ix_payments_rental_status (reference_id, status),
  CONSTRAINT fk_payments_rental
    FOREIGN KEY (reference_id) REFERENCES rentals (rental_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO roles (name, description) VALUES
  ('ADMIN', 'Administración completa del sistema.'),
  ('OPERACIONES', 'Gestión de estaciones, reservas y alquileres.'),
  ('MANTENIMIENTO', 'Gestión del mantenimiento de bicicletas.'),
  ('SOPORTE', 'Consulta y soporte operativo.'),
  ('CLIENTE', 'Acceso de cliente a sus operaciones.')
ON DUPLICATE KEY UPDATE
  description = VALUES(description),
  is_active = 1;

INSERT INTO resources (method, path, description) VALUES
  ('GET', '/api/bicycles/available', 'Consultar bicicletas disponibles.'),
  ('POST', '/api/reservations', 'Crear una reserva.'),
  ('POST', '/api/rentals/start', 'Iniciar un alquiler.'),
  ('POST', '/api/rentals/finish', 'Finalizar un alquiler.'),
  ('POST', '/api/maintenances', 'Registrar mantenimiento.')
ON DUPLICATE KEY UPDATE
  description = VALUES(description),
  is_active = 1;

INSERT INTO role_resources (role_id, resource_id, is_allowed)
SELECT role_id, resource_id, 1
FROM roles CROSS JOIN resources
WHERE roles.name = 'ADMIN'
ON DUPLICATE KEY UPDATE is_allowed = 1;

INSERT INTO role_resources (role_id, resource_id, is_allowed)
SELECT roles.role_id, resources.resource_id, 1
FROM roles
CROSS JOIN resources
WHERE roles.name = 'OPERACIONES'
  AND resources.path IN (
  '/api/bicycles/available',
  '/api/reservations',
  '/api/rentals/start',
  '/api/rentals/finish'
  )
ON DUPLICATE KEY UPDATE is_allowed = 1;

INSERT INTO role_resources (role_id, resource_id, is_allowed)
SELECT roles.role_id, resources.resource_id, 1
FROM roles
CROSS JOIN resources
WHERE roles.name = 'MANTENIMIENTO'
  AND resources.path IN (
    '/api/bicycles/available',
    '/api/maintenances'
  )
ON DUPLICATE KEY UPDATE is_allowed = 1;

INSERT INTO role_resources (role_id, resource_id, is_allowed)
SELECT roles.role_id, resources.resource_id, 1
FROM roles
CROSS JOIN resources
WHERE roles.name = 'SOPORTE'
  AND resources.method = 'GET'
ON DUPLICATE KEY UPDATE is_allowed = 1;

INSERT INTO role_resources (role_id, resource_id, is_allowed)
SELECT roles.role_id, resources.resource_id, 1
FROM roles
CROSS JOIN resources
WHERE roles.name = 'CLIENTE'
  AND resources.path IN (
    '/api/bicycles/available',
    '/api/reservations'
  )
ON DUPLICATE KEY UPDATE is_allowed = 1;
