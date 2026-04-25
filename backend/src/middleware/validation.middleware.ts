import { Request, Response, NextFunction } from 'express';
import { ValidationChain, validationResult } from 'express-validator';
import { AppError } from '../utils/AppError';

/**
 * Ejecuta todos los validators y, si hay errores, lanza AppError 422.
 * Uso:
 *   router.post('/', validar([body('email').isEmail(), ...]), controller);
 */
export const validar =
  (validations: ValidationChain[]) =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    await Promise.all(validations.map((v) => v.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      next();
      return;
    }

    // Convertir a un objeto { campo: 'mensaje' } más fácil de consumir
    const details: Record<string, string> = {};
    for (const err of errors.array()) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const path = (err as any).path ?? (err as any).param ?? 'unknown';
      if (!details[path]) details[path] = err.msg;
    }
    next(new AppError('Datos inválidos', 422, details));
  };
