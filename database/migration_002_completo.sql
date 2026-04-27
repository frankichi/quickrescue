-- ============================================================
--  Migración 002 (completo): tablas escaneos_qr + compras + columnas usuarios
--  Idempotente: usa IF NOT EXISTS para no romper en DBs que ya tienen
--  parte del esquema (caso típico: la tabla escaneos_qr existe del v1.1.0).
--  Ejecutar UNA vez en producción Postgres (Render).
-- ============================================================

-- 1) escaneos_qr (puede ya existir del v1.1.0, sin la columna `direccion`)
CREATE TABLE IF NOT EXISTS escaneos_qr (
    id              BIGSERIAL PRIMARY KEY,
    tipo            VARCHAR(20)   NOT NULL CHECK (tipo IN ('usuario','familiar','mascota')),
    referencia_id   INTEGER       NOT NULL,
    titular_id      INTEGER       NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
    latitud         DECIMAL(10,8),
    longitud        DECIMAL(11,8),
    direccion       VARCHAR(255),
    ip              VARCHAR(45),
    user_agent      TEXT,
    creado_en       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Si la tabla ya existía sin `direccion` (caso v1.1.0), agregarla:
ALTER TABLE escaneos_qr ADD COLUMN IF NOT EXISTS direccion VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_escaneos_titular_fecha
    ON escaneos_qr(titular_id, creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_escaneos_ref
    ON escaneos_qr(tipo, referencia_id);

-- 2) compras
CREATE TABLE IF NOT EXISTS compras (
    id                 SERIAL PRIMARY KEY,
    usuario_id         INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
    producto           VARCHAR(50) NOT NULL CHECK (producto IN ('collar','pulsera','llavero')),
    destinatario_tipo  VARCHAR(20) NOT NULL CHECK (destinatario_tipo IN ('usuario','familiar','mascota')),
    destinatario_id    INTEGER NOT NULL,
    precio             DECIMAL(10,2) NOT NULL,
    estado             VARCHAR(20) NOT NULL DEFAULT 'pendiente'
                       CHECK (estado IN ('pendiente','confirmado','enviado','entregado','cancelado')),
    notas              TEXT,
    creado_en          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_compras_usuario_fecha
    ON compras(usuario_id, creado_en DESC);

-- Trigger para mantener `actualizado_en` (reusa la función ya creada en
-- schema.postgres.sql). Si se está ejecutando esta migración sin el schema
-- base, la función no existe — créala condicionalmente.
CREATE OR REPLACE FUNCTION trg_actualizado_en()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_compras_actualizado ON compras;
CREATE TRIGGER trg_compras_actualizado
    BEFORE UPDATE ON compras
    FOR EACH ROW EXECUTE FUNCTION trg_actualizado_en();

-- 3) Columnas nuevas en usuarios
-- foto: puede ya existir del schema base (VARCHAR 255). Si no, créala.
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS foto VARCHAR(500);
-- onesignal_player_id: NUEVO, para push notifications en Fase 2.
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS onesignal_player_id VARCHAR(100);

-- 4) Columna foto en familiares (nueva, para foto del ser querido)
ALTER TABLE familiares ADD COLUMN IF NOT EXISTS foto VARCHAR(500);
