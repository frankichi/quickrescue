import { Usuario, Familiar, Ubicacion } from '../models';
import { AppError } from '../utils/AppError';
import { enviarEmail } from '../config/mailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export interface DatosSOS {
  latitud: number;
  longitud: number;
  mensaje?: string;
}

/**
 * Construye el HTML del email SOS. Incluye link clickeable a Google Maps.
 */
const construirHTML = (
  usuario: Usuario,
  datos: DatosSOS,
  ubicacionId: number
): string => {
  const mapsLink = `${env.googleMapsBaseUrl}${datos.latitud},${datos.longitud}`;
  const fecha = new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' });

  return `
<!DOCTYPE html>
<html>
<body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#f4f4f4;margin:0;padding:20px;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e0e0e0;">
    <div style="background:#d62828;color:#ffffff;padding:24px;text-align:center;">
      <h1 style="margin:0;font-size:24px;">🚨 ALERTA SOS</h1>
    </div>
    <div style="padding:24px;">
      <p style="font-size:16px;line-height:1.5;margin:0 0 16px;">
        <strong>${usuario.nombre} ${usuario.apellido}</strong> ha activado
        el botón SOS desde la app Quick Rescue.
      </p>
      ${datos.mensaje ? `<p style="background:#fff3cd;border-left:4px solid #ffc107;padding:12px;margin:16px 0;border-radius:4px;">
        <strong>Mensaje:</strong> ${datos.mensaje.replace(/</g, '&lt;')}
      </p>` : ''}
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:8px 0;color:#666;">📅 Fecha:</td>
            <td style="padding:8px 0;"><strong>${fecha}</strong></td></tr>
        <tr><td style="padding:8px 0;color:#666;">📍 Coordenadas:</td>
            <td style="padding:8px 0;"><strong>${datos.latitud}, ${datos.longitud}</strong></td></tr>
        <tr><td style="padding:8px 0;color:#666;">🆔 ID reporte:</td>
            <td style="padding:8px 0;"><strong>#${ubicacionId}</strong></td></tr>
      </table>
      <div style="text-align:center;margin:24px 0;">
        <a href="${mapsLink}" target="_blank"
           style="display:inline-block;background:#d62828;color:#ffffff;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:16px;">
          📍 Ver ubicación en Google Maps
        </a>
      </div>
      <hr style="border:none;border-top:1px solid #e0e0e0;margin:24px 0;">
      <p style="font-size:13px;color:#888;margin:0;">
        Este email fue enviado automáticamente porque estás registrado como
        familiar de contacto de emergencia. Por favor verifica que esté bien y
        contáctalo lo antes posible.
      </p>
    </div>
  </div>
</body>
</html>`;
};

/**
 * Disparo del SOS:
 *   1. Inserta una Ubicacion con es_sos = true
 *   2. Carga los familiares
 *   3. Envía emails en paralelo
 *
 * No falla la request si algunos emails fallan; los errores se loguean.
 */
export const dispararSOS = async (uid: number, datos: DatosSOS) => {
  const usuario = await Usuario.findByPk(uid);
  if (!usuario) throw new AppError('Usuario no encontrado', 404);

  const ubicacion = await Ubicacion.create({
    usuario_id: uid,
    latitud:    datos.latitud,
    longitud:   datos.longitud,
    es_sos:     true,
    mensaje:    datos.mensaje ?? null,
  });

  const familiares = await Familiar.findAll({
    where: { usuario_id: uid },
  });

  const conEmail = familiares.filter((f) => !!f.email);
  if (conEmail.length === 0) {
    logger.warn(`SOS de uid=${uid} sin familiares con email`);
    return { familiares_notificados: 0, ubicacion_id: ubicacion.id };
  }

  const html = construirHTML(usuario, datos, ubicacion.id);
  const subject = `🚨 SOS de ${usuario.nombre} ${usuario.apellido}`;

  // Enviar en paralelo, contar cuántos llegaron
  const resultados = await Promise.all(
    conEmail.map((f) =>
      enviarEmail({ to: f.email!, subject, html })
    )
  );
  const exitosos = resultados.filter(Boolean).length;

  return {
    familiares_notificados: exitosos,
    familiares_totales: conEmail.length,
    ubicacion_id: ubicacion.id,
  };
};
