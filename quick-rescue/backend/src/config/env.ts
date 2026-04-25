import dotenv from 'dotenv';
import path from 'path';

// Carga .env desde la raíz del backend (no necesario en producción
// porque Render/Vercel inyectan las vars directamente en process.env)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Variable de entorno requerida no definida: ${key}`);
  }
  return value;
};

const optional = (key: string, defaultValue: string): string =>
  process.env[key] ?? defaultValue;

export const env = {
  nodeEnv: optional('NODE_ENV', 'development'),
  port: parseInt(optional('PORT', '3000'), 10),
  isProduction: optional('NODE_ENV', 'development') === 'production',

  // Connection string. El dialect (mysql/postgres) se detecta del prefijo.
  databaseUrl: required('DATABASE_URL'),

  jwt: {
    secret: required('JWT_SECRET'),
    expiresIn: optional('JWT_EXPIRES_IN', '15m'),
    refreshExpiresIn: optional('JWT_REFRESH_EXPIRES_IN', '30d'),
  },

  resend: {
    apiKey: optional('RESEND_API_KEY', ''),
    from: optional('EMAIL_FROM', 'Quick Rescue <onboarding@resend.dev>'),
  },

  corsOrigins: optional('CORS_ORIGINS', '*')
    .split(',')
    .map((s) => s.trim()),

  googleMapsBaseUrl: optional('GOOGLE_MAPS_BASE_URL', 'https://www.google.com/maps?q='),
};
