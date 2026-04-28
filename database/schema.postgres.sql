-- ============================================================
--  Quick Rescue — Esquema PostgreSQL (Render free tier)
--  Versión equivalente a schema.mysql.sql
-- ============================================================

-- En Render Postgres NO necesitas CREATE DATABASE: la base ya existe.
-- Si quisieras crearla manualmente:
--   CREATE DATABASE quickrescue WITH ENCODING 'UTF8';

DROP TABLE IF EXISTS compras CASCADE;
DROP TABLE IF EXISTS escaneos_qr CASCADE;
DROP TABLE IF EXISTS ubicaciones CASCADE;
DROP TABLE IF EXISTS historial_medico CASCADE;
DROP TABLE IF EXISTS mascotas CASCADE;
DROP TABLE IF EXISTS familiares CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- --------------------------------------------------------
--  USUARIOS
-- --------------------------------------------------------
CREATE TABLE usuarios (
    id                 SERIAL PRIMARY KEY,
    nombre             VARCHAR(80)  NOT NULL,
    apellido           VARCHAR(80)  NOT NULL,
    dni                VARCHAR(15),
    email              VARCHAR(120) NOT NULL UNIQUE,
    password_hash      VARCHAR(255) NOT NULL,
    foto                VARCHAR(500),
    onesignal_player_id VARCHAR(100),
    telefono           VARCHAR(20),
    fecha_nacimiento   DATE,
    direccion          VARCHAR(200),
    distrito           VARCHAR(60),
    provincia          VARCHAR(60),
    activo             BOOLEAN      NOT NULL DEFAULT TRUE,
    creado_en          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en     TIMESTAMP,
    CONSTRAINT uk_usuarios_dni UNIQUE (dni)
);

-- Trigger para actualizar 'actualizado_en' automáticamente
CREATE OR REPLACE FUNCTION trg_actualizado_en()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_usuarios_actualizado
    BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION trg_actualizado_en();

-- --------------------------------------------------------
--  FAMILIARES
-- --------------------------------------------------------
CREATE TABLE familiares (
    id               SERIAL PRIMARY KEY,
    usuario_id       INTEGER      NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
    nombre           VARCHAR(120) NOT NULL,
    apellido         VARCHAR(80),
    dni              VARCHAR(15),
    fecha_nacimiento DATE,
    telefono         VARCHAR(20)  NOT NULL,
    email            VARCHAR(120),
    relacion         VARCHAR(40)  NOT NULL,
    foto             VARCHAR(500),
    direccion        VARCHAR(200),
    distrito         VARCHAR(60),
    provincia        VARCHAR(60),
    grupo_sanguineo  VARCHAR(5),
    alergias         TEXT,
    enfermedades     TEXT,
    operaciones      TEXT,
    medicamentos     TEXT,
    creado_en        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX ix_familiares_usuario ON familiares(usuario_id);

-- --------------------------------------------------------
--  MASCOTAS
--  1 usuario → N mascotas. Se pueden marcar como perdidas
--  para mostrarlas en una vista pública.
-- --------------------------------------------------------
CREATE TABLE mascotas (
    id               SERIAL PRIMARY KEY,
    usuario_id       INTEGER      NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
    nombre           VARCHAR(80)  NOT NULL,
    especie          VARCHAR(20)  NOT NULL,
    raza             VARCHAR(60),
    color            VARCHAR(40),
    edad_anios       SMALLINT,
    foto             VARCHAR(255),
    microchip        VARCHAR(40),
    perdida          BOOLEAN      NOT NULL DEFAULT FALSE,
    mensaje_perdida  TEXT,
    alergias         TEXT,
    medicamentos     TEXT,
    condiciones      TEXT,
    creado_en        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX ix_mascotas_usuario ON mascotas(usuario_id);

CREATE TRIGGER trg_mascotas_actualizado
    BEFORE UPDATE ON mascotas
    FOR EACH ROW EXECUTE FUNCTION trg_actualizado_en();

-- --------------------------------------------------------
--  HISTORIAL MÉDICO
-- --------------------------------------------------------
CREATE TABLE historial_medico (
    id              SERIAL PRIMARY KEY,
    usuario_id      INTEGER NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
    alergias        TEXT,
    enfermedades    TEXT,
    operaciones     TEXT,
    medicamentos    TEXT,
    grupo_sanguineo VARCHAR(5),
    actualizado_en  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_historial_actualizado
    BEFORE UPDATE ON historial_medico
    FOR EACH ROW EXECUTE FUNCTION trg_actualizado_en();

-- --------------------------------------------------------
--  UBICACIONES
-- --------------------------------------------------------
CREATE TABLE ubicaciones (
    id           BIGSERIAL PRIMARY KEY,
    usuario_id   INTEGER         NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
    latitud      NUMERIC(10,7)   NOT NULL,
    longitud     NUMERIC(10,7)   NOT NULL,
    precision_m  SMALLINT,
    es_sos       BOOLEAN         NOT NULL DEFAULT FALSE,
    mensaje      VARCHAR(500),
    "timestamp"  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX ix_ubicaciones_usuario_ts ON ubicaciones(usuario_id, "timestamp" DESC);

-- --------------------------------------------------------
--  ESCANEOS QR
--  Cada vez que un transeúnte escanea un QR físico se inserta
--  un registro y se notifica por email al titular.
-- --------------------------------------------------------
CREATE TABLE escaneos_qr (
    id              BIGSERIAL PRIMARY KEY,
    tipo            VARCHAR(20)     NOT NULL CHECK (tipo IN ('usuario','familiar','mascota')),
    referencia_id   INTEGER         NOT NULL,
    titular_id      INTEGER         NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
    latitud         DECIMAL(10,8),
    longitud        DECIMAL(11,8),
    direccion       VARCHAR(255),
    ip              VARCHAR(45),
    user_agent      TEXT,
    creado_en       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_escaneos_titular_fecha ON escaneos_qr(titular_id, creado_en DESC);
CREATE INDEX idx_escaneos_ref           ON escaneos_qr(tipo, referencia_id);

-- --------------------------------------------------------
--  COMPRAS (tienda Quick Rescue)
-- --------------------------------------------------------
CREATE TABLE compras (
    id                 SERIAL PRIMARY KEY,
    usuario_id         INTEGER     NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
    producto           VARCHAR(50) NOT NULL CHECK (producto IN ('collar','pulsera','llavero')),
    destinatario_tipo  VARCHAR(20) NOT NULL CHECK (destinatario_tipo IN ('usuario','familiar','mascota')),
    destinatario_id    INTEGER     NOT NULL,
    precio             DECIMAL(10,2) NOT NULL,
    estado             VARCHAR(20) NOT NULL DEFAULT 'pendiente'
                       CHECK (estado IN ('pendiente','confirmado','enviado','entregado','cancelado')),
    notas              TEXT,
    creado_en          TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en     TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_compras_usuario_fecha ON compras(usuario_id, creado_en DESC);

CREATE TRIGGER trg_compras_actualizado
    BEFORE UPDATE ON compras
    FOR EACH ROW EXECUTE FUNCTION trg_actualizado_en();
