-- ============================================================
--  Migración 003 — Quick Rescue v1.2
--
--  Agrega campos para Fase 1.5 + Fase 2:
--  · usuarios.telefono              (Commit 1 — fix bug "Llamar al titular")
--  · familiares.<datos personales y médicos>   (Commit 2)
--  · mascotas.<datos médicos opcionales>       (Commit 3)
--
--  IDEMPOTENTE: usa ADD COLUMN IF NOT EXISTS y puede ejecutarse
--  N veces seguidas sin error en Postgres 9.6+.
-- ============================================================

-- ------------------------------------------------------------
--  Commit 1 — usuarios.telefono
--  La página pública del QR mostraba "Llamar al titular" pero
--  no había número que llamar. Ahora vive en el propio usuario.
-- ------------------------------------------------------------
ALTER TABLE usuarios
    ADD COLUMN IF NOT EXISTS telefono VARCHAR(20);

-- ------------------------------------------------------------
--  Commit 2 — familiares: datos personales y médicos
--
--  Antes el familiar tenía solo (nombre, telefono, email,
--  relacion, foto). Ahora se separa nombre/apellido y se
--  agregan dirección + datos médicos (alergias, medicamentos,
--  etc.) que se mostrarán en la página pública del QR.
--
--  La columna `nombre` NO se rebautiza: en producción puede
--  contener "Nombre Apellido" para registros viejos. Los
--  nuevos formularios alimentan `nombre` y `apellido` por
--  separado; los viejos quedan con `apellido = NULL` y la UI
--  los muestra tal cual sin perder datos.
-- ------------------------------------------------------------
ALTER TABLE familiares ADD COLUMN IF NOT EXISTS apellido         VARCHAR(80);
ALTER TABLE familiares ADD COLUMN IF NOT EXISTS dni              VARCHAR(15);
ALTER TABLE familiares ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE;
ALTER TABLE familiares ADD COLUMN IF NOT EXISTS direccion        VARCHAR(200);
ALTER TABLE familiares ADD COLUMN IF NOT EXISTS distrito         VARCHAR(60);
ALTER TABLE familiares ADD COLUMN IF NOT EXISTS provincia        VARCHAR(60);
ALTER TABLE familiares ADD COLUMN IF NOT EXISTS grupo_sanguineo  VARCHAR(5);
ALTER TABLE familiares ADD COLUMN IF NOT EXISTS alergias         TEXT;
ALTER TABLE familiares ADD COLUMN IF NOT EXISTS enfermedades     TEXT;
ALTER TABLE familiares ADD COLUMN IF NOT EXISTS operaciones      TEXT;
ALTER TABLE familiares ADD COLUMN IF NOT EXISTS medicamentos     TEXT;

-- ------------------------------------------------------------
--  Commit 3 — mascotas: datos médicos opcionales
--
--  Para que el QR físico de una mascota muestre alergias o
--  medicamentos cuando el dueño quiera dejarlos visibles al
--  rescatista (ej. perro con alergia a ciertos medicamentos).
--
--  La columna `microchip` se mantiene tal cual (no se elimina)
--  pero ya no se expone en la UI desde Fase 1.5.
-- ------------------------------------------------------------
ALTER TABLE mascotas ADD COLUMN IF NOT EXISTS alergias     TEXT;
ALTER TABLE mascotas ADD COLUMN IF NOT EXISTS medicamentos TEXT;
ALTER TABLE mascotas ADD COLUMN IF NOT EXISTS condiciones  TEXT;
