import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import api from './routes';
import { errorHandler, notFound } from './middleware/error.middleware';

/**
 * Construye la app Express con middlewares y rutas.
 * Separado de main.ts para facilitar tests con supertest.
 */
export const crearApp = (): Express => {
  const app = express();

  // Seguridad
  app.use(helmet());
  app.use(
    cors({
      origin: (origin, cb) => {
        // Permitir requests sin origin (mobile apps, Postman, curl)
        if (!origin) return cb(null, true);
        if (env.corsOrigins.includes('*') || env.corsOrigins.includes(origin)) {
          return cb(null, true);
        }
        cb(new Error(`Origen no permitido por CORS: ${origin}`));
      },
      credentials: true,
    })
  );

  // Parseo de body con límite generoso para fotos en base64
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));

  // Logging HTTP (formato corto en dev, combinado en prod)
  app.use(morgan(env.isProduction ? 'combined' : 'dev'));

  // Rutas API
  app.use('/api/v1', api);

  // Healthcheck a la raíz también (Render/Vercel suelen pegar a /)
  app.get('/', (_req, res) => res.json({ name: 'Quick Rescue API', version: '1.0.0' }));

  // 404 + error handler (deben ir al final)
  app.use(notFound);
  app.use(errorHandler);

  return app;
};
