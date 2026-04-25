import bcrypt from 'bcrypt';

const ROUNDS = 10;

/**
 * Hash de contraseña con bcrypt. 10 rounds es el sweet-spot
 * entre seguridad y velocidad para 2026.
 */
export const hashearPassword = (plain: string): Promise<string> =>
  bcrypt.hash(plain, ROUNDS);

export const verificarPassword = (plain: string, hash: string): Promise<boolean> =>
  bcrypt.compare(plain, hash);
