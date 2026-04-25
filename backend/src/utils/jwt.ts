import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export interface PayloadToken {
  uid: number;          // ID del usuario
  email: string;
}

/**
 * Firma un access token con TTL corto (15 min por defecto).
 */
export const firmarAccessToken = (payload: PayloadToken): string =>
  jwt.sign(payload, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  } as SignOptions);

/**
 * Verifica el token y devuelve el payload, o null si es inválido/expirado.
 */
export const verificarToken = (token: string): PayloadToken | null => {
  try {
    return jwt.verify(token, env.jwt.secret) as PayloadToken;
  } catch {
    return null;
  }
};
