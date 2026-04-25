import { Request, Response, NextFunction } from 'express';
import { verificarToken, PayloadToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';

// Extender Request para que TypeScript conozca req.user
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: PayloadToken;
    }
  }
}

/**
 * Verifica el header `Authorization: Bearer <token>` y deja el payload en
 * `req.user`. Si falla, lanza 401.
 */
export const autenticar = (req: Request, _res: Response, next: NextFunction): void => {
  const header = req.headers.authorization ?? '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    throw new AppError('Token requerido', 401);
  }
  const payload = verificarToken(match[1]);
  if (!payload) {
    throw new AppError('Token inválido o expirado', 401);
  }
  req.user = payload;
  next();
};
