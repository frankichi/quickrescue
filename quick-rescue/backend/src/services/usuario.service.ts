import { Usuario } from '../models';
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
