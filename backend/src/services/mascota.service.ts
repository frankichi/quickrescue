import { Mascota } from '../models';
import { AppError } from '../utils/AppError';

export interface DatosMascota {
  nombre: string;
  especie: string;
  raza?: string | null;
  color?: string | null;
  edad_anios?: number | null;
  foto?: string | null;
  microchip?: string | null;
  perdida?: boolean;
  mensaje_perdida?: string | null;
  alergias?: string | null;
  medicamentos?: string | null;
  condiciones?: string | null;
}

export const listar = (uid: number) =>
  Mascota.findAll({
    where: { usuario_id: uid },
    order: [['creado_en', 'DESC']],
  });

export const crear = (uid: number, datos: DatosMascota) =>
  Mascota.create({
    usuario_id:      uid,
    nombre:          datos.nombre,
    especie:         datos.especie,
    raza:            datos.raza ?? null,
    color:           datos.color ?? null,
    edad_anios:      datos.edad_anios ?? null,
    foto:            datos.foto ?? null,
    microchip:       datos.microchip ?? null,
    perdida:         datos.perdida ?? false,
    mensaje_perdida: datos.mensaje_perdida ?? null,
    alergias:        datos.alergias     ?? null,
    medicamentos:    datos.medicamentos ?? null,
    condiciones:     datos.condiciones  ?? null,
  });

const cargarPropia = async (uid: number, id: number): Promise<Mascota> => {
  const mascota = await Mascota.findOne({ where: { id, usuario_id: uid } });
  if (!mascota) throw new AppError('Mascota no encontrada', 404);
  return mascota;
};

export const actualizar = async (uid: number, id: number, datos: Partial<DatosMascota>) => {
  const mascota = await cargarPropia(uid, id);
  if (datos.nombre          !== undefined) mascota.nombre          = datos.nombre;
  if (datos.especie         !== undefined) mascota.especie         = datos.especie;
  if (datos.raza            !== undefined) mascota.raza            = datos.raza ?? null;
  if (datos.color           !== undefined) mascota.color           = datos.color ?? null;
  if (datos.edad_anios      !== undefined) mascota.edad_anios      = datos.edad_anios ?? null;
  if (datos.foto            !== undefined) mascota.foto            = datos.foto ?? null;
  if (datos.microchip       !== undefined) mascota.microchip       = datos.microchip ?? null;
  if (datos.perdida         !== undefined) mascota.perdida         = datos.perdida;
  if (datos.mensaje_perdida !== undefined) mascota.mensaje_perdida = datos.mensaje_perdida ?? null;
  if (datos.alergias        !== undefined) mascota.alergias        = datos.alergias        ?? null;
  if (datos.medicamentos    !== undefined) mascota.medicamentos    = datos.medicamentos    ?? null;
  if (datos.condiciones     !== undefined) mascota.condiciones     = datos.condiciones     ?? null;
  await mascota.save();
  return mascota;
};

export const eliminar = async (uid: number, id: number) => {
  const mascota = await cargarPropia(uid, id);
  await mascota.destroy();
  return { eliminado: true };
};
