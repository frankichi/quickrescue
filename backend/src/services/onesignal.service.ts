import { Usuario } from '../models';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const ONESIGNAL_API = 'https://onesignal.com/api/v1/notifications';

export interface PushPayload {
  title: string;
  message: string;
  url?: string;
  data?: Record<string, unknown>;
}

/**
 * Persiste el subscription_id de OneSignal del titular logueado.
 * El SDK v16 expone OneSignal.User.PushSubscription.id como UUID v4.
 */
export const guardarSubscription = async (
  uid: number,
  subscriptionId: string,
): Promise<void> => {
  // El UPDATE directo evita pisar campos que el caller no controla.
  await Usuario.update(
    { onesignal_player_id: subscriptionId, actualizado_en: new Date() },
    { where: { id: uid } },
  );
};

/** Limpia el subscription_id (logout o revocación de permisos). */
export const removerSubscription = async (uid: number): Promise<void> => {
  await Usuario.update(
    { onesignal_player_id: null, actualizado_en: new Date() },
    { where: { id: uid } },
  );
};

/**
 * Envía un push al titular indicado, usando el subscription_id guardado.
 * Best-effort: si el usuario no tiene subscription, si OneSignal no está
 * configurado, o si OneSignal devuelve error, se loguea y se retorna sin
 * lanzar — el flow del caller (ej. registrar escaneo) NO debe romper.
 */
export const sendPushToUser = async (
  usuarioId: number,
  payload: PushPayload,
): Promise<void> => {
  if (!env.onesignal.appId || !env.onesignal.restApiKey) {
    logger.warn('OneSignal no configurado (APP_ID o REST_API_KEY vacíos); skip push');
    return;
  }

  const usuario = await Usuario.findByPk(usuarioId);
  if (!usuario?.onesignal_player_id) {
    logger.info(`Usuario ${usuarioId} sin subscription OneSignal; skip push`);
    return;
  }

  const body = {
    app_id: env.onesignal.appId,
    include_subscription_ids: [usuario.onesignal_player_id],
    headings:  { en: payload.title,   es: payload.title },
    contents:  { en: payload.message, es: payload.message },
    url:       payload.url ?? env.publicWebBase,
    data:      payload.data ?? {},
  };

  try {
    const r = await fetch(ONESIGNAL_API, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${env.onesignal.restApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!r.ok) {
      const txt = await r.text().catch(() => '');
      logger.error(`OneSignal respondió ${r.status}: ${txt.slice(0, 300)}`);
      return;
    }

    const json = (await r.json().catch(() => null)) as { id?: string; recipients?: number } | null;
    logger.info(
      `Push enviado a usuario=${usuarioId} subscription=${usuario.onesignal_player_id} ` +
      `notification_id=${json?.id ?? 'n/a'} recipients=${json?.recipients ?? 0}`,
    );
  } catch (e) {
    logger.error('Error llamando a OneSignal (push best-effort)', e);
  }
};
