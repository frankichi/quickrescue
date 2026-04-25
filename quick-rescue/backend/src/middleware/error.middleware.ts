import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

/**
 * Express error handler. Debe ir DESPUÉS de todas las rutas.
 * Convierte cualquier error a una respuesta JSON estándar.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
    return;
  }

  // Error inesperado: log completo, respuesta genérica
  logger.error(`Unhandled: ${err.message}`, err.stack);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
  });
};

/**
 * Wrapper para que async/await en handlers propaguen errores al middleware
 * de error. Sin esto, una promesa rechazada en un controller cuelga la req.
 */
export const asyncHandler =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

/**
 * 404 handler para rutas no definidas. Va antes del errorHandler.
 */
export const notFound = (req: Request, _res: Response, next: NextFunction): void => {
  next(new AppError(`Ruta no encontrada: ${req.method} ${req.originalUrl}`, 404));
};
