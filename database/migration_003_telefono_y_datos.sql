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
