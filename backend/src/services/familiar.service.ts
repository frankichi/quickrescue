import { Familiar } from '../models';
import { AppError } from '../utils/AppError';

export interface DatosFamiliar {
  nombre: string;
  apellido?: string | null;
  dni?: string | null;
  fecha_nacimiento?: string | null;
  telefono: string;
  email?: string | null;
  relacion: string;
  foto?: string | null;
  direccion?: string | null;
  distrito?: string | null;
  provincia?: string | null;
  grupo_sanguineo?: string | null;
  alergias?: string | null;
  enfermedades?: string | null;
  operaciones?: string | null;
  medicamentos?: string | null;
}

const CAMPOS_OPCIONALES = [
  'apellido', 'dni', 'fecha_nacimiento',
  'email', 'foto',
  'direccion', 'distrito', 'provincia',
  'grupo_sanguineo', 'alergias', 'enfermedades', 'operaciones', 'medicamentos',
] as const;

const aFecha = (v: string | null | undefined): Date | null => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const listar = (uid: number) =>
  Familiar.findAll({
    where: { usuario_id: uid },
    order: [['creado_en', 'DESC']],
  });

export const crear = (uid: number, datos: DatosFamiliar) =>
  Familiar.create({
    usuario_id:       uid,
    nombre:           datos.nombre,
    apellido:         datos.apellido         ?? null,
    dni:              datos.dni              ?? null,
    fecha_nacimiento: aFecha(datos.fecha_nacimiento),
    telefono:         datos.telefono,
    email:            datos.email            ?? null,
    relacion:         datos.relacion,
    foto:             datos.foto             ?? null,
    direccion:        datos.direccion        ?? null,
    distrito:         datos.distrito         ?? null,
    provincia:        datos.provincia        ?? null,
    grupo_sanguineo:  datos.grupo_sanguineo  ?? null,
    alergias:         datos.alergias         ?? null,
    enfermedades:     datos.enfermedades     ?? null,
    operaciones:      datos.operaciones      ?? null,
    medicamentos:     datos.medicamentos     ?? null,
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
  if (datos.relacion !== undefined) familiar.relacion = datos.relacion;
  if (datos.fecha_nacimiento !== undefined) {
    familiar.fecha_nacimiento = aFecha(datos.fecha_nacimiento);
  }
  for (const campo of CAMPOS_OPCIONALES) {
    if (campo === 'fecha_nacimiento') continue;
    if (datos[campo] !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (familiar as any)[campo] = (datos[campo] ?? null);
    }
  }

  await familiar.save();
  return familiar;
};

export const eliminar = async (uid: number, id: number) => {
  const familiar = await cargarPropio(uid, id);
  await familiar.destroy();
  return { eliminado: true };
};
