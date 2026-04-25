import { Resend } from 'resend';
import { env } from './env';
import { logger } from '../utils/logger';

/**
 * Cliente de Resend, lazy-loaded.
 * Si RESEND_API_KEY no está definido (desarrollo sin email), los envíos
 * se loguean en consola en vez de fallar.
 */
let resendClient: Resend | null = null;

const getClient = (): Resend | null => {
  if (resendClient) return resendClient;
  if (!env.resend.apiKey) {
    logger.warn('RESEND_API_KEY no configurado. Los emails serán logueados en consola.');
    return null;
  }
  resendClient = new Resend(env.resend.apiKey);
  return resendClient;
};

export interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

/**
 * Envía un email. Devuelve true si el envío fue exitoso (o si fue
 * "exitosamente logueado" en modo desarrollo).
 */
export const enviarEmail = async (params: EmailParams): Promise<boolean> => {
  const client = getClient();
  if (!client) {
    logger.info(`[EMAIL MOCK] Para: ${params.to} | Asunto: ${params.subject}`);
    return true;
  }
  try {
    const result = await client.emails.send({
      from: env.resend.from,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
    if (result.error) {
      logger.error(`Resend error: ${result.error.message}`);
      return false;
    }
    logger.info(`Email enviado a ${params.to} (id: ${result.data?.id})`);
    return true;
  } catch (error) {
    logger.error('Error enviando email', error);
    return false;
  }
};
