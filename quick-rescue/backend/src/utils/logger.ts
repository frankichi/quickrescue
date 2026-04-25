/* eslint-disable no-console */

/**
 * Logger minimalista. Para producción seria considerar pino o winston.
 * El nivel se ajusta con NODE_ENV (development=debug, production=info).
 */
const formato = (nivel: string, mensaje: string): string => {
  const ts = new Date().toISOString();
  return `[${ts}] ${nivel.padEnd(5)} ${mensaje}`;
};

export const logger = {
  debug: (msg: string, ...meta: unknown[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(formato('DEBUG', msg), ...meta);
    }
  },
  info:  (msg: string, ...meta: unknown[]) => console.log(formato('INFO', msg), ...meta),
  warn:  (msg: string, ...meta: unknown[]) => console.warn(formato('WARN', msg), ...meta),
  error: (msg: string, ...meta: unknown[]) => console.error(formato('ERROR', msg), ...meta),
};
