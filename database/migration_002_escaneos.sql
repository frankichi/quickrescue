-- ============================================================
--  Migración 002: tabla escaneos_qr
--  Aplicar UNA vez en producción Postgres (Render).
--  En MySQL local: ver schema.mysql.sql (ya incluye esta tabla).
-- ============================================================

CREATE TABLE IF NOT EXISTS escaneos_qr (
    id              BIGSERIAL PRIMARY KEY,
    tipo            VARCHAR(20)   NOT NULL CHECK (tipo IN ('usuario','familiar','mascota')),
    referencia_id   INTEGER       NOT NULL,
    titular_id      INTEGER       NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
    latitud         NUMERIC(10,7),
    longitud        NUMERIC(10,7),
    ip              VARCHAR(45),
    user_agent      VARCHAR(500),
    creado_en       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_escaneos_titular_fecha
    ON escaneos_qr(titular_id, creado_en DESC);

CREATE INDEX IF NOT EXISTS ix_escaneos_ref
    ON escaneos_qr(tipo, referencia_id);
