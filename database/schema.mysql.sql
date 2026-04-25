-- ============================================================
--  Quick Rescue — Esquema de base de datos
--  MySQL 8 / MariaDB 10.2+
--  Charset: utf8mb4
-- ============================================================

CREATE DATABASE IF NOT EXISTS quickrescue
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE quickrescue;

-- Drop en orden inverso por las FKs
DROP TABLE IF EXISTS ubicaciones;
DROP TABLE IF EXISTS historial_medico;
DROP TABLE IF EXISTS mascotas;
DROP TABLE IF EXISTS familiares;
DROP TABLE IF EXISTS usuarios;

-- --------------------------------------------------------
--  USUARIOS
--  El usuario ES la persona a rescatar Y quien se loguea.
-- --------------------------------------------------------
CREATE TABLE usuarios (
    id                 INT UNSIGNED   NOT NULL AUTO_INCREMENT,
    nombre             VARCHAR(80)    NOT NULL,
    apellido           VARCHAR(80)    NOT NULL,
    dni                VARCHAR(15)    DEFAULT NULL,
    email              VARCHAR(120)   NOT NULL,
    password_hash      VARCHAR(255)   NOT NULL,            -- bcrypt
    foto               VARCHAR(255)   DEFAULT NULL,        -- URL o ruta
    fecha_nacimiento   DATE           DEFAULT NULL,
    direccion          VARCHAR(200)   DEFAULT NULL,
    distrito           VARCHAR(60)    DEFAULT NULL,
    provincia          VARCHAR(60)    DEFAULT NULL,
    activo             TINYINT(1)     NOT NULL DEFAULT 1,
    creado_en          DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en     DATETIME       DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_usuarios_email (email),
    UNIQUE KEY uk_usuarios_dni   (dni)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
--  FAMILIARES
--  Contactos de emergencia. 1 usuario → N familiares.
--  Reciben emails al disparar SOS.
-- --------------------------------------------------------
CREATE TABLE familiares (
    id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
    usuario_id   INT UNSIGNED NOT NULL,
    nombre       VARCHAR(120) NOT NULL,
    telefono     VARCHAR(20)  NOT NULL,
    email        VARCHAR(120) DEFAULT NULL,
    relacion     VARCHAR(40)  NOT NULL,                    -- "Hijo", "Esposa", etc.
    creado_en    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY ix_familiares_usuario (usuario_id),
    CONSTRAINT fk_familiares_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
--  MASCOTAS
--  1 usuario → N mascotas. `perdida` permite habilitar
--  una vista pública con `mensaje_perdida`.
-- --------------------------------------------------------
CREATE TABLE mascotas (
    id               INT UNSIGNED      NOT NULL AUTO_INCREMENT,
    usuario_id       INT UNSIGNED      NOT NULL,
    nombre           VARCHAR(80)       NOT NULL,
    especie          VARCHAR(20)       NOT NULL,                  -- "perro", "gato", "otro"
    raza             VARCHAR(60)       DEFAULT NULL,
    color            VARCHAR(40)       DEFAULT NULL,
    edad_anios       SMALLINT UNSIGNED DEFAULT NULL,
    foto             VARCHAR(255)      DEFAULT NULL,
    microchip        VARCHAR(40)       DEFAULT NULL,
    perdida          TINYINT(1)        NOT NULL DEFAULT 0,
    mensaje_perdida  TEXT              DEFAULT NULL,
    creado_en        DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en   DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP
                     ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY ix_mascotas_usuario (usuario_id),
    CONSTRAINT fk_mascotas_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
--  HISTORIAL MÉDICO
--  Relación 1-a-1 con usuarios. Se crea automáticamente
--  al registrar el usuario (vacío) y luego se actualiza.
-- --------------------------------------------------------
CREATE TABLE historial_medico (
    id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
    usuario_id      INT UNSIGNED NOT NULL,
    alergias        TEXT         DEFAULT NULL,
    enfermedades    TEXT         DEFAULT NULL,
    operaciones     TEXT         DEFAULT NULL,
    medicamentos    TEXT         DEFAULT NULL,             -- añadido al brief original
    grupo_sanguineo VARCHAR(5)   DEFAULT NULL,             -- añadido al brief original
    actualizado_en  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
                    ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_historial_usuario (usuario_id),
    CONSTRAINT fk_historial_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
--  UBICACIONES
--  Histórico append-only de geolocalización.
--  Se inserta desde la app móvil cada cierto tiempo
--  o cuando se pulsa el botón SOS.
-- --------------------------------------------------------
CREATE TABLE ubicaciones (
    id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    usuario_id   INT UNSIGNED    NOT NULL,
    latitud      DECIMAL(10,7)   NOT NULL,
    longitud     DECIMAL(10,7)   NOT NULL,
    precision_m  SMALLINT UNSIGNED DEFAULT NULL,
    es_sos       TINYINT(1)      NOT NULL DEFAULT 0,        -- TRUE si vino del botón SOS
    mensaje      VARCHAR(500)    DEFAULT NULL,              -- mensaje opcional del SOS
    `timestamp`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY ix_ubicaciones_usuario_ts (usuario_id, `timestamp`),
    CONSTRAINT fk_ubicaciones_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
