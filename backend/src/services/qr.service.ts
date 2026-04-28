import fs from 'fs';
import path from 'path';
import { Usuario, Familiar, Mascota, HistorialMedico, Escaneo } from '../models';
import { AppError } from '../utils/AppError';
import { enviarEmail } from '../config/mailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import type { TipoEscaneo } from '../models/escaneo.model';

const TIPOS_VALIDOS: TipoEscaneo[] = ['usuario', 'familiar', 'mascota'];
export const esTipoValido = (t: string): t is TipoEscaneo =>
  (TIPOS_VALIDOS as string[]).includes(t);

/** Calcula edad en años desde una fecha (string YYYY-MM-DD o Date). */
const edadDesde = (fecha: Date | string | null): number | null => {
  if (!fecha) return null;
  const f = typeof fecha === 'string' ? new Date(fecha) : fecha;
  if (Number.isNaN(f.getTime())) return null;
  const hoy = new Date();
  let edad = hoy.getFullYear() - f.getFullYear();
  const m = hoy.getMonth() - f.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < f.getDate())) edad--;
  return edad >= 0 ? edad : null;
};

// ----------------------------------------------------------
// Tipos del contrato público (lo que ve un transeúnte rescatista)
// ----------------------------------------------------------

export interface ContactoTitularPublico {
  nombre: string;
  telefono: string | null;
  email: string | null;
}

/**
 * Forma unificada de "datos médicos" expuesta al transeúnte. Los campos
 * irrelevantes para una entidad concreta van en `null`:
 *  · usuario / familiar → grupo_sanguineo, alergias, enfermedades,
 *                         operaciones, medicamentos.
 *  · mascota            → alergias, medicamentos, condiciones.
 */
export interface DatosMedicosPublicos {
  grupo_sanguineo: string | null;
  alergias:        string | null;
  enfermedades:    string | null;
  operaciones:     string | null;
  medicamentos:    string | null;
  condiciones:     string | null;
}

const SIN_DATOS_MEDICOS: DatosMedicosPublicos = {
  grupo_sanguineo: null,
  alergias:        null,
  enfermedades:    null,
  operaciones:     null,
  medicamentos:    null,
  condiciones:     null,
};

interface PerfilPublicoBase {
  id: number;
  titular_id: number;
  nombre_completo: string;
  foto_url: string | null;
  datos_medicos: DatosMedicosPublicos;
  contacto_titular: ContactoTitularPublico;
}

export interface PerfilPublicoUsuario extends PerfilPublicoBase {
  tipo: 'usuario';
  edad: number | null;
  dni: string | null;
}

export interface PerfilPublicoFamiliar extends PerfilPublicoBase {
  tipo: 'familiar';
  edad: number | null;
}

export interface PerfilPublicoMascota extends PerfilPublicoBase {
  tipo: 'mascota';
  especie: string;
  raza: string | null;
  color: string | null;
  edad_anios: number | null;
  perdida: boolean;
  mensaje_perdida: string | null;
}

export type PerfilPublico =
  | PerfilPublicoUsuario
  | PerfilPublicoFamiliar
  | PerfilPublicoMascota;

// ----------------------------------------------------------
// Helpers internos
// ----------------------------------------------------------

const armarContacto = (titular: Usuario): ContactoTitularPublico => ({
  nombre:   `${titular.nombre} ${titular.apellido}`.trim(),
  telefono: titular.telefono ?? null,
  email:    titular.email    ?? null,
});

const requireTitularActivo = async (id: number): Promise<Usuario> => {
  const u = await Usuario.findOne({ where: { id, activo: true } });
  if (!u) throw new AppError('QR no válido', 404);
  return u;
};

// ----------------------------------------------------------
// Endpoint público: GET /api/v1/qr/:tipo/:id/publico
// ----------------------------------------------------------

/**
 * Devuelve la información PÚBLICA y SEGURA de un QR. Lo consume el
 * frontend público (PublicQR.tsx) y la plantilla de email de escaneo.
 *
 * Nunca incluye password_hash, ni el DNI de un familiar (sí el del
 * propio titular si tipo='usuario'). El email del titular SÍ se expone:
 * permite al rescatista contactar por mail si el teléfono no responde.
 */
export const obtenerPerfilPublico = async (
  tipo: TipoEscaneo,
  id: number,
): Promise<PerfilPublico> => {
  if (tipo === 'usuario') {
    const titular = await requireTitularActivo(id);
    const historial = await HistorialMedico.findOne({ where: { usuario_id: id } });
    return {
      tipo,
      id,
      titular_id: titular.id,
      nombre_completo: `${titular.nombre} ${titular.apellido}`.trim(),
      foto_url: titular.foto,
      edad: edadDesde(titular.fecha_nacimiento),
      dni:  titular.dni,
      datos_medicos: {
        grupo_sanguineo: historial?.grupo_sanguineo ?? null,
        alergias:        historial?.alergias        ?? null,
        enfermedades:    historial?.enfermedades    ?? null,
        operaciones:     historial?.operaciones     ?? null,
        medicamentos:    historial?.medicamentos    ?? null,
        condiciones:     null,
      },
      contacto_titular: armarContacto(titular),
    };
  }

  if (tipo === 'familiar') {
    const f = await Familiar.findByPk(id);
    if (!f) throw new AppError('QR no válido', 404);
    const titular = await requireTitularActivo(f.usuario_id);
    const nombreCompleto = f.apellido ? `${f.nombre} ${f.apellido}` : f.nombre;
    return {
      tipo,
      id,
      titular_id: titular.id,
      nombre_completo: nombreCompleto,
      foto_url: f.foto,
      edad: edadDesde(f.fecha_nacimiento),
      datos_medicos: {
        grupo_sanguineo: f.grupo_sanguineo ?? null,
        alergias:        f.alergias        ?? null,
        enfermedades:    f.enfermedades    ?? null,
        operaciones:     f.operaciones     ?? null,
        medicamentos:    f.medicamentos    ?? null,
        condiciones:     null,
      },
      contacto_titular: armarContacto(titular),
    };
  }

  // mascota
  const m = await Mascota.findByPk(id);
  if (!m) throw new AppError('QR no válido', 404);
  const titular = await requireTitularActivo(m.usuario_id);
  return {
    tipo,
    id,
    titular_id: titular.id,
    nombre_completo: m.nombre,
    foto_url: m.foto,
    especie: m.especie,
    raza:    m.raza,
    color:   m.color,
    edad_anios: m.edad_anios,
    perdida: m.perdida,
    mensaje_perdida: m.mensaje_perdida,
    // Los campos médicos de mascota se añaden en Commit 3.
    datos_medicos: { ...SIN_DATOS_MEDICOS },
    contacto_titular: armarContacto(titular),
  };
};

// ----------------------------------------------------------
// Reverse geocoding con Nominatim (OpenStreetMap, sin API key)
// ----------------------------------------------------------
const reverseGeocode = async (lat: number, lon: number): Promise<string | null> => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=16&addressdetails=1`;
    const r = await fetch(url, {
      headers: {
        // Nominatim exige User-Agent identificable.
        'User-Agent': 'QuickRescue/1.1 (contact: support@quickrescue.pe)',
        'Accept-Language': 'es',
      },
    });
    if (!r.ok) return null;
    const j = (await r.json()) as { display_name?: string };
    return j.display_name ? j.display_name.slice(0, 255) : null;
  } catch (e) {
    logger.error('Nominatim reverse geocode error', e);
    return null;
  }
};

// ----------------------------------------------------------
// Email "alguien escaneó el QR"
// ----------------------------------------------------------
const cargarPlantilla = (): string => {
  const ruta = path.join(__dirname, '..', 'emails', 'alguien-escaneo.html');
  return fs.readFileSync(ruta, 'utf-8');
};

const renderHTML = (
  perfil: PerfilPublico,
  esc: { latitud: number | null; longitud: number | null; direccion: string | null },
): string => {
  let html = cargarPlantilla();
  const fecha = new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' });
  const tipoLabel = perfil.tipo === 'mascota' ? 'tu mascota'
                  : perfil.tipo === 'familiar' ? 'tu familiar'
                  : 'ti';
  const mapsLink = esc.latitud != null && esc.longitud != null
    ? `${env.googleMapsBaseUrl}${esc.latitud},${esc.longitud}`
    : '';
  const ubicacionBloque = esc.latitud != null && esc.longitud != null
    ? `<p><strong>📍 Ubicación:</strong> ${(esc.direccion ?? `${esc.latitud}, ${esc.longitud}`).replace(/</g, '&lt;')}</p>
       <p style="text-align:center;margin:16px 0;">
         <a href="${mapsLink}" target="_blank"
            style="display:inline-block;background:#5BA0D0;color:#fff;padding:12px 22px;text-decoration:none;border-radius:6px;font-weight:bold;">
           Ver en mapa
         </a>
       </p>`
    : `<p style="background:#fff3cd;border-left:4px solid #ffc107;padding:10px;border-radius:4px;">
         El transeúnte no compartió su ubicación. Solo sabemos que el QR fue escaneado.
       </p>`;

  const fotoSrc = perfil.foto_url && perfil.foto_url.length > 0
    ? `<img src="${perfil.foto_url}" alt="${perfil.nombre_completo}" width="120" height="120"
            style="border-radius:60px;object-fit:cover;display:block;margin:0 auto;border:3px solid #5BA0D0;" />`
    : '';

  const reemplazos: Record<string, string> = {
    '{{NOMBRE}}': perfil.nombre_completo.replace(/</g, '&lt;'),
    '{{TIPO_LABEL}}': tipoLabel,
    '{{FECHA}}': fecha,
    '{{UBICACION_BLOQUE}}': ubicacionBloque,
    '{{FOTO_BLOQUE}}': fotoSrc,
    '{{APP_URL}}': env.publicWebBase,
  };
  for (const [k, v] of Object.entries(reemplazos)) html = html.split(k).join(v);
  return html;
};

// ----------------------------------------------------------
// Registro de escaneo
// ----------------------------------------------------------
export interface DatosEscaneo {
  tipo: TipoEscaneo;
  referencia_id: number;
  latitud?: number | null;
  longitud?: number | null;
  ip?: string | null;
  user_agent?: string | null;
}

/**
 * Registra el escaneo, hace reverse geocoding (si hay coords), y notifica
 * al titular por email. No falla si el email falla (solo loguea).
 * El push notification queda como TODO para Fase 2 (OneSignal).
 */
export const registrarEscaneo = async (datos: DatosEscaneo) => {
  const perfil = await obtenerPerfilPublico(datos.tipo, datos.referencia_id);

  let direccion: string | null = null;
  if (datos.latitud != null && datos.longitud != null) {
    direccion = await reverseGeocode(datos.latitud, datos.longitud);
  }

  const escaneo = await Escaneo.create({
    tipo:          datos.tipo,
    referencia_id: datos.referencia_id,
    titular_id:    perfil.titular_id,
    latitud:       datos.latitud  ?? null,
    longitud:      datos.longitud ?? null,
    direccion,
    ip:            datos.ip ?? null,
    user_agent:    datos.user_agent ?? null,
  });

  // Email al titular
  const titular = await Usuario.findByPk(perfil.titular_id);
  if (titular?.email) {
    const html = renderHTML(perfil, {
      latitud: datos.latitud ?? null,
      longitud: datos.longitud ?? null,
      direccion,
    });
    enviarEmail({
      to: titular.email,
      subject: `Alguien escaneó el QR de ${perfil.nombre_completo}`,
      html,
    }).catch((e) => logger.error('Error enviando email de escaneo', e));
  }

  // TODO Fase 2: push con OneSignal usando titular.onesignal_player_id
  if (titular?.onesignal_player_id) {
    logger.info(
      `[push placeholder] enviar a player_id=${titular.onesignal_player_id} ` +
      `escaneo=${escaneo.id}`,
    );
  }

  return { escaneo_id: escaneo.id, notificado: !!titular?.email };
};
