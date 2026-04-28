import { useEffect, useState } from 'react';
import OneSignal from 'react-onesignal';

// Singleton: evita doble init bajo StrictMode o navegaciones de React Router.
let inicializadoPromesa: Promise<void> | null = null;

const APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID as string | undefined;

const inicializar = async (): Promise<void> => {
  if (!APP_ID) {
    // Sin APP_ID no hay nada que hacer; lo logueamos solo en dev.
    if (import.meta.env.DEV) {
      console.warn('[OneSignal] VITE_ONESIGNAL_APP_ID no definido; SDK no inicializado');
    }
    return;
  }
  if (!inicializadoPromesa) {
    inicializadoPromesa = OneSignal.init({
      appId: APP_ID,
      allowLocalhostAsSecureOrigin: true,
      // No promptear automáticamente: lo hacemos en el flow de login.
      autoResubscribe: true,
    }).catch((e) => {
      // Si falla, permitimos reintentar resetando la promesa.
      console.error('[OneSignal] init falló', e);
      inicializadoPromesa = null;
      throw e;
    });
  }
  return inicializadoPromesa;
};

/**
 * Hook que inicializa el SDK al montar la app. NO promptea ni vincula
 * external_id por sí mismo — eso es responsabilidad del login flow.
 */
export const useOneSignal = (): { listo: boolean } => {
  const [listo, setListo] = useState(false);
  useEffect(() => {
    inicializar()
      .then(() => setListo(true))
      .catch(() => setListo(false));
  }, []);
  return { listo };
};

export { OneSignal, inicializar as inicializarOneSignal };
