import OneSignal from 'react-onesignal';
import { api } from './api';
import { inicializarOneSignal } from '../hooks/useOneSignal';

/** Espera a que OneSignal entregue un subscription_id (con timeout). */
const esperarSubscriptionId = async (timeoutMs = 10_000): Promise<string | null> => {
  const inicio = Date.now();
  while (Date.now() - inicio < timeoutMs) {
    const id = OneSignal.User?.PushSubscription?.id ?? null;
    if (id) return id;
    await new Promise((r) => setTimeout(r, 250));
  }
  return null;
};

/** Persiste el subscription_id en backend. */
export const guardarSubscription = async (subscriptionId: string): Promise<void> => {
  await api.post('/usuarios/me/onesignal-subscription', { subscription_id: subscriptionId });
};

export const removerSubscription = async (): Promise<void> => {
  await api.delete('/usuarios/me/onesignal-subscription');
};

/**
 * Llamado tras un login/registro exitoso:
 *   1. Asegura SDK inicializado.
 *   2. Vincula external_id (= usuario.id) para identificar al receptor.
 *   3. Promptea permiso de push (slidedown amigable).
 *   4. Si el usuario acepta, guarda el subscription_id en el backend.
 *
 * Best-effort: cualquier error se loguea sin lanzar — el push no es
 * crítico para el flow de login.
 */
export const promptearYRegistrar = async (usuarioId: number): Promise<string | null> => {
  try {
    await inicializarOneSignal();
    await OneSignal.login(String(usuarioId));
    await OneSignal.Slidedown.promptPush();
    const id = await esperarSubscriptionId();
    if (id) await guardarSubscription(id);
    return id;
  } catch (e) {
    console.error('[OneSignal] promptearYRegistrar falló', e);
    return null;
  }
};

/** Devuelve el subscription_id actual o null si no hay permiso/registro. */
export const obtenerSubscriptionId = (): string | null =>
  OneSignal.User?.PushSubscription?.id ?? null;

/** Ejecutar al hacer logout: desvincula al usuario y borra del backend. */
export const cerrarSesionPush = async (): Promise<void> => {
  try {
    await removerSubscription();
  } catch (e) {
    console.error('[OneSignal] removerSubscription falló', e);
  }
  try {
    await OneSignal.logout();
  } catch {
    // si SDK no estaba inicializado no hay nada que hacer
  }
};
