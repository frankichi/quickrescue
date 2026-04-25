-- Migración 001: agregar tabla mascotas a una BD que ya existe.
-- Solo crea lo nuevo, no toca tablas existentes.

CREATE TABLE IF NOT EXISTS mascotas (
    id               SERIAL PRIMARY KEY,
    usuario_id       INTEGER       NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
    nombre           VARCHAR(80)   NOT NULL,
    especie          VARCHAR(20)   NOT NULL,
    raza             VARCHAR(60),
    color            VARCHAR(40),
    edad_anios       SMALLINT,
    foto             VARCHAR(255),
    microchip        VARCHAR(40),
    perdida          BOOLEAN       NOT NULL DEFAULT FALSE,
    mensaje_perdida  TEXT,
    creado_en        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en   TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_mascotas_usuario ON mascotas(usuario_id);

DROP TRIGGER IF EXISTS trg_mascotas_actualizado ON mascotas;
CREATE TRIGGER trg_mascotas_actualizado
    BEFORE UPDATE ON mascotas
    FOR EACH ROW EXECUTE FUNCTION trg_actualizado_en();
