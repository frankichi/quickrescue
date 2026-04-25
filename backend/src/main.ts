import { crearApp } from './app';
import { env } from './config/env';
import { conectarDB } from './config/database';
import { registrarAsociaciones } from './models';
import { logger } from './utils/logger';

/**
 * Bootstrap. Verifica conexión a BD y arranca el server.
 * Si la BD no está disponible, falla rápido con código 1.
 */
const bootstrap = async (): Promise<void> => {
  try {
    registrarAsociaciones();
    await conectarDB();

    const app = crearApp();
    app.listen(env.port, () => {
      logger.info(`🚀 Quick Rescue API escuchando en puerto ${env.port}`);
      logger.info(`   Entorno: ${env.nodeEnv}`);
      logger.info(`   Healthcheck: http://localhost:${env.port}/api/v1/health`);
    });
  } catch (error) {
    logger.error('Bootstrap falló', error);
    process.exit(1);
  }
};

// Manejo de promesas no capturadas (común en Node async/await)
process.on('unhandledRejection', (reason) => {
  logger.error('UnhandledRejection:', reason);
});

bootstrap();
