import { Usuario, HistorialMedico, Familiar } from '../models';
import { AppError } from '../utils/AppError';

const CAMPOS_EDITABLES = [
  'nombre', 'apellido', 'dni', 'foto',
  'fecha_nacimiento', 'direccion', 'distrito', 'provincia',
] as const;

type CamposEditables = Partial<Record<(typeof CAMPOS_EDITABLES)[number], unknown>>;

export const obtenerMiPerfil = async (uid: number) => {
  const usuario = await Usuario.findByPk(uid);
  if (!usuario) throw new AppError('Usuario no encontrado', 404);
  return usuario.toJSONSeguro();
};

/**
 * Actualiza solo los campos permitidos. Email y password se cambian
 * con endpoints separados (TODO).
 */
export const actualizarMiPerfil = async (uid: number, datos: CamposEditables) => {
  const usuario = await Usuario.findByPk(uid);
  if (!usuario) throw new AppError('Usuario no encontrado', 404);

  for (const campo of CAMPOS_EDITABLES) {
    if (datos[campo] !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (usuario as any)[campo] = datos[campo];
    }
  }
  usuario.actualizado_en = new Date();
  await usuario.save();

  return usuario.toJSONSeguro();
};

/** Soft-delete: marca como inactivo en lugar de borrar. */
export const eliminarMiCuenta = async (uid: number) => {
  const usuario = await Usuario.findByPk(uid);
  if (!usuario) throw new AppError('Usuario no encontrado', 404);
  usuario.activo = false;
  await usuario.save();
  return { eliminado: true };
};

/**
 * Perfil público mínimo, expuesto al escanear el QR del usuario. NO incluye
 * email, password, dni ni datos de contacto privados del titular: solo lo
 * que un rescatista necesita en una emergencia.
 */
export const obtenerPerfilPublico = async (id: number) => {
  const usuario = await Usuario.findOne({
    where: { id, activo: true },
    include: [
      { model: HistorialMedico, as: 'historial', required: false },
      { model: Familiar,        as: 'familiares', required: false },
    ],
  });
  if (!usuario) throw new AppError('Perfil no disponible', 404);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const u = usuario as any;
  const historial = u.historial as HistorialMedico | null | undefined;
  const familiares = (u.familiares ?? []) as Familiar[];

  return {
    id:               usuario.id,
    nombre:           usuario.nombre,
    apellido:         usuario.apellido,
    foto:             usuario.foto,
    grupo_sanguineo:  historial?.grupo_sanguineo ?? null,
    alergias:         historial?.alergias        ?? null,
    enfermedades:     historial?.enfermedades    ?? null,
    medicamentos:     historial?.medicamentos    ?? null,
    familiares: familiares.map((f) => ({
      nombre:   f.nombre,
      telefono: f.telefono,
      relacion: f.relacion,
    })),
  };
};
