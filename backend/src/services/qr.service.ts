import { Usuario, Familiar, Mascota, HistorialMedico, Escaneo } from '../models';
import { AppError } from '../utils/AppError';
import { enviarEmail } from '../config/mailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import type { TipoEscaneo } from '../models/escaneo.model';

const TIPOS_VALIDOS: TipoEscaneo[] = ['usuario', 'familiar', 'mascota'];

export const esTipoValido = (t: string): t is TipoEscaneo =>
  (TIPOS_VALIDOS as string[]).includes(t);

/**
 * Datos públicos que ve un transeúnte cuando escanea un QR.
 * Pensado para ser MÍNIMO: identificar a la persona/mascota y poder
 * contactar al titular. Nunca incluye email del titular ni DNI.
 */
export interface PerfilPublico {
  tipo: TipoEscaneo;
  id: number;
  titular_id: number;
  nombre: string;
  subtitulo: string;            // "Adulto" | "Hijo" | "Perro - Bulldog", etc.
  foto: string | null;
  // Datos médicos (solo aplica a personas)
  grupo_sanguineo?: string | null;
  alergias?:        string | null;
  enfermedades?:    string | null;
  medicamentos?:    string | null;
  // Específico mascota
  microchip?:       string | null;
  perdida?:         boolean;
  mensaje_perdida?: string | null;
  // Contacto
  contacto: {
    nombre_titular: string;
    telefono: string | null;     // teléfono del primer familiar (titular no tiene tel)
    relacion: string | null;
    familiares: Array<{ nombre: string; telefono: string; relacion: string }>;
  };
}

const familiaresContacto = async (titularId: number) => {
  const lista = await Familiar.findAll({
    where: { usuario_id: titularId },
    order: [['creado_en', 'ASC']],
  });
  return lista.map((f) => ({
    nombre: f.nombre, telefono: f.telefono, relacion: f.relacion,
  }));
};

const armarContacto = async (titular: Usuario) => {
  const familiares = await familiaresContacto(titular.id);
  const principal = familiares[0] ?? null;
  return {
    nombre_titular: `${titular.nombre} ${titular.apellido}`,
    telefono: principal?.telefono ?? null,
    relacion: principal?.relacion ?? null,
    familiares,
  };
};

const requireTitularActivo = async (id: number): Promise<Usuario> => {
  const u = await Usuario.findOne({ where: { id, activo: true } });
  if (!u) throw new AppError('QR no válido', 404);
  return u;
};

/**
 * Resuelve el perfil público de un QR. Lanza 404 si:
 *  - el tipo no es válido
 *  - la entidad no existe
 *  - el titular asociado está inactivo
 */
export const resolverQR = async (
  tipo: TipoEscaneo,
  id: number,
): Promise<PerfilPublico> => {
  if (tipo === 'usuario') {
    const titular = await requireTitularActivo(id);
    const historial = await HistorialMedico.findOne({ where: { usuario_id: id } });
    const contacto = await armarContacto(titular);
    return {
      tipo, id, titular_id: titular.id,
      nombre: `${titular.nombre} ${titular.apellido}`,
      subtitulo: 'Titular',
      foto: titular.foto,
      grupo_sanguineo: historial?.grupo_sanguineo ?? null,
      alergias:        historial?.alergias        ?? null,
      enfermedades:    historial?.enfermedades    ?? null,
      medicamentos:    historial?.medicamentos    ?? null,
      contacto,
    };
  }

  if (tipo === 'familiar') {
    const f = await Familiar.findByPk(id);
    if (!f) throw new AppError('QR no válido', 404);
    const titular = await requireTitularActivo(f.usuario_id);
    const contacto = await armarContacto(titular);
    return {
      tipo, id, titular_id: titular.id,
      nombre: f.nombre,
      subtitulo: f.relacion,
      foto: null,
      contacto,
    };
  }

  // mascota
  const m = await Mascota.findByPk(id);
  if (!m) throw new AppError('QR no válido', 404);
  const titular = await requireTitularActivo(m.usuario_id);
  const contacto = await armarContacto(titular);
  const subtituloPartes = [m.especie, m.raza].filter(Boolean) as string[];
  return {
    tipo, id, titular_id: titular.id,
    nombre: m.nombre,
    subtitulo: subtituloPartes.join(' - '),
    foto: m.foto,
    microchip:       m.microchip,
    perdida:         m.perdida,
    mensaje_perdida: m.mensaje_perdida,
    contacto,
  };
};

export interface DatosEscaneo {
  tipo: TipoEscaneo;
  referencia_id: number;
  latitud?: number | null;
  longitud?: number | null;
  ip?: string | null;
  user_agent?: string | null;
}

const construirHTMLEscaneo = (
  perfil: PerfilPublico,
  esc: DatosEscaneo,
): string => {
  const fecha = new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' });
  const tieneCoords = esc.latitud != null && esc.longitud != null;
  const mapsLink = tieneCoords
    ? `${env.googleMapsBaseUrl}${esc.latitud},${esc.longitud}`
    : null;

  const tipoLabel = esc.tipo === 'mascota' ? 'tu mascota'
                  : esc.tipo === 'familiar' ? 'tu familiar'
                  : 'ti';

  return `
<!DOCTYPE html>
<html>
<body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#f4f4f4;margin:0;padding:20px;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e0e0e0;">
    <div style="background:#d62828;color:#ffffff;padding:24px;text-align:center;">
      <h1 style="margin:0;font-size:22px;">📡 Alguien escaneó el QR de ${perfil.nombre}</h1>
    </div>
    <div style="padding:24px;">
      <p style="font-size:16px;line-height:1.5;margin:0 0 16px;">
        El código QR de ${tipoLabel} <strong>${perfil.nombre}</strong> fue escaneado.
        Puede ser que alguien lo encontró y necesite contactarte.
      </p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:8px 0;color:#666;">📅 Fecha:</td>
            <td style="padding:8px 0;"><strong>${fecha}</strong></td></tr>
        ${tieneCoords ? `
        <tr><td style="padding:8px 0;color:#666;">📍 Ubicación:</td>
            <td style="padding:8px 0;"><strong>${esc.latitud}, ${esc.longitud}</strong></td></tr>
        ` : ''}
      </table>
      ${mapsLink ? `
      <div style="text-align:center;margin:24px 0;">
        <a href="${mapsLink}" target="_blank"
           style="display:inline-block;background:#d62828;color:#ffffff;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:16px;">
          📍 Ver ubicación en Google Maps
        </a>
      </div>
      ` : `
      <p style="background:#fff3cd;border-left:4px solid #ffc107;padding:12px;margin:16px 0;border-radius:4px;">
        El transeúnte no compartió su ubicación. Solo sabemos que el QR fue escaneado.
      </p>
      `}
      <hr style="border:none;border-top:1px solid #e0e0e0;margin:24px 0;">
      <p style="font-size:13px;color:#888;margin:0;">
        Ingresa a la app Quick Rescue para ver el historial completo de escaneos.
      </p>
    </div>
  </div>
</body>
</html>`;
};

/**
 * Registra el escaneo y notifica al titular por email. No falla la
 * request del transeúnte si el email falla; solo se loguea.
 */
export const registrarEscaneo = async (datos: DatosEscaneo) => {
  const perfil = await resolverQR(datos.tipo, datos.referencia_id);

  const escaneo = await Escaneo.create({
    tipo:          datos.tipo,
    referencia_id: datos.referencia_id,
    titular_id:    perfil.titular_id,
    latitud:       datos.latitud  ?? null,
    longitud:      datos.longitud ?? null,
    ip:            datos.ip       ?? null,
    user_agent:    datos.user_agent ? datos.user_agent.slice(0, 500) : null,
  });

  // Notificar al titular (email del usuario, no del familiar)
  const titular = await Usuario.findByPk(perfil.titular_id);
  if (titular?.email) {
    const html = construirHTMLEscaneo(perfil, datos);
    enviarEmail({
      to: titular.email,
      subject: `Alguien escaneó el QR de ${perfil.nombre}`,
      html,
    }).catch((e) => logger.error('Error enviando email de escaneo', e));
  }

  return { escaneo_id: escaneo.id, notificado: !!titular?.email };
};
