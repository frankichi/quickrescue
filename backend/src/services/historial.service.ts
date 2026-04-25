import { HistorialMedico } from '../models';

interface DatosHistorial {
  alergias?: string | null;
  enfermedades?: string | null;
  operaciones?: string | null;
  medicamentos?: string | null;
  grupo_sanguineo?: string | null;
}

export const obtener = async (uid: number) => {
  // findOrCreate para que si por alguna razón no existe, se cree vacío
  const [historial] = await HistorialMedico.findOrCreate({
    where: { usuario_id: uid },
    defaults: { usuario_id: uid },
  });
  return historial;
};

export const actualizar = async (uid: number, datos: DatosHistorial) => {
  const historial = await obtener(uid);
  if (datos.alergias        !== undefined) historial.alergias        = datos.alergias;
  if (datos.enfermedades    !== undefined) historial.enfermedades    = datos.enfermedades;
  if (datos.operaciones     !== undefined) historial.operaciones     = datos.operaciones;
  if (datos.medicamentos    !== undefined) historial.medicamentos    = datos.medicamentos;
  if (datos.grupo_sanguineo !== undefined) historial.grupo_sanguineo = datos.grupo_sanguineo;
  historial.actualizado_en = new Date();
  await historial.save();
  return historial;
};
