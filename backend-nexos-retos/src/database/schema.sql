CREATE TABLE IF NOT EXISTS empresas (
  id CHAR(36) PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  nit VARCHAR(30) NOT NULL UNIQUE,
  sector VARCHAR(100) NOT NULL,
  contacto VARCHAR(150) NOT NULL,
  correo VARCHAR(254) NOT NULL,
  telefono VARCHAR(40) NOT NULL DEFAULT '',
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS categorias (
  id CHAR(36) PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS prioridades (
  id CHAR(36) PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  nivel INT UNSIGNED NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS usuarios (
  id CHAR(36) PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  correo VARCHAR(254) NOT NULL UNIQUE,
  rol ENUM('Participante', 'Evaluador', 'Administrador') NOT NULL,
  estado ENUM('Activo', 'Inactivo') NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS auth_credentials (
  userId CHAR(36) PRIMARY KEY,
  passwordHash VARCHAR(255) NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  CONSTRAINT fk_auth_credentials_usuario FOREIGN KEY (userId) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS retos (
  id CHAR(36) PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT NOT NULL,
  empresaId CHAR(36) NOT NULL,
  categoriaId CHAR(36) NOT NULL,
  prioridadId CHAR(36) NOT NULL,
  fechaInicio DATE NOT NULL,
  fechaFin DATE NOT NULL,
  estado ENUM('Abierto', 'En revisión', 'Cerrado') NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  CONSTRAINT fk_retos_empresa FOREIGN KEY (empresaId) REFERENCES empresas(id) ON DELETE RESTRICT,
  CONSTRAINT fk_retos_categoria FOREIGN KEY (categoriaId) REFERENCES categorias(id) ON DELETE RESTRICT,
  CONSTRAINT fk_retos_prioridad FOREIGN KEY (prioridadId) REFERENCES prioridades(id) ON DELETE RESTRICT,
  INDEX idx_retos_estado (estado),
  INDEX idx_retos_fechaFin (fechaFin)
);

CREATE TABLE IF NOT EXISTS registros (
  id CHAR(36) PRIMARY KEY,
  usuarioId CHAR(36) NOT NULL,
  retoId CHAR(36) NOT NULL,
  fechaRegistro DATE NOT NULL,
  observacion TEXT NOT NULL,
  estado ENUM('Pendiente', 'Aprobado', 'Rechazado') NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  CONSTRAINT uq_registros_usuario_reto UNIQUE (usuarioId, retoId),
  CONSTRAINT fk_registros_usuario FOREIGN KEY (usuarioId) REFERENCES usuarios(id) ON DELETE RESTRICT,
  CONSTRAINT fk_registros_reto FOREIGN KEY (retoId) REFERENCES retos(id) ON DELETE RESTRICT,
  INDEX idx_registros_fecha (fechaRegistro)
);
