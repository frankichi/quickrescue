import { Familiar } from '../models';
import { AppError } from '../utils/AppError';

export interface DatosFamiliar {
  nombre: string;
  telefono: string;
  email?: string;
  relacion: string;
}

export const listar = (uid: number) =>
  Familiar.findAll({
    where: { usuario_id: uid },
    order: [['creado_en', 'DESC']],
  });

export const crear = (uid: number, datos: DatosFamiliar) =>
  Familiar.create({
    usuario_id: uid,
    nombre:     datos.nombre,
    telefono:   datos.telefono,
    email:      datos.email ?? null,
    relacion:   datos.relacion,
  });

const cargarPropio = async (uid: number, id: number): Promise<Familiar> => {
  const familiar = await Familiar.findOne({ where: { id, usuario_id: uid } });
  if (!familiar) throw new AppError('Familiar no encontrado', 404);
  return familiar;
};

export const actualizar = async (uid: number, id: number, datos: Partial<DatosFamiliar>) => {
  const familiar = await cargarPropio(uid, id);
  if (datos.nombre   !== undefined) familiar.nombre   = datos.nombre;
  if (datos.telefono !== undefined) familiar.telefono = datos.telefono;
  if (datos.email    !== undefined) familiar.email    = datos.email;
  if (datos.relacion !== undefined) familiar.relacion = datos.relacion;
  await familiar.save();
  return familiar;
};

export const eliminar = async (uid: number, id: number) => {
  const familiar = await cargarPropio(uid, id);
  await familiar.destroy();
  return { eliminado: true };
};
