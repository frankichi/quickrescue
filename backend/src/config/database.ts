import { Sequelize, Dialect } from 'sequelize';
import { env } from './env';
import { logger } from '../utils/logger';

/**
 * Detecta el dialect de la base de datos a partir del prefijo de DATABASE_URL.
 * Soporta MySQL (`mysql://`) y PostgreSQL (`postgres://` o `postgresql://`).
 *
 * Esto permite usar el mismo código en local con MySQL y en producción
 * (Render) con PostgreSQL sin tocar nada.
 */
const detectarDialect = (url: string): Dialect => {
  if (url.startsWith('mysql://')) return 'mysql';
  if (url.startsWith('postgres://') || url.startsWith('postgresql://')) return 'postgres';
  throw new Error(
    `DATABASE_URL no reconocido. Debe empezar con mysql:// o postgres://. Recibido: ${url.substring(0, 12)}...`
  );
};

const dialect = detectarDialect(env.databaseUrl);

/**
 * Instancia única de Sequelize. Las opciones SSL son necesarias para
 * conexiones a Render/Aiven que requieren TLS.
 */
export const sequelize = new Sequelize(env.databaseUrl, {
  dialect,
  logging: env.nodeEnv === 'development' ? (msg) => logger.debug(msg) : false,
  define: {
    // Sequelize por defecto agrega createdAt/updatedAt automáticamente, pero
    // las tablas tienen columnas creado_en/actualizado_en propias.
    timestamps: false,
    underscored: true,
  },
  pool: {
    max: 5,                  // Render free tiene RAM limitada, no abusemos
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions: env.isProduction
    ? {
        ssl: {
          require: true,
          // Render usa certificados auto-firmados; rejectUnauthorized=false los acepta.
          // En MySQL/Aiven usar `ssl: { rejectUnauthorized: true }` con CA.
          rejectUnauthorized: false,
        },
      }
    : {},
});

/**
 * Verifica que la conexión funciona. Llamar al arrancar el server.
 */
export const conectarDB = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info(`✓ Conectado a ${dialect.toUpperCase()} (${env.nodeEnv})`);
  } catch (error) {
    logger.error('✗ No se pudo conectar a la base de datos', error);
    throw error;
  }
};
