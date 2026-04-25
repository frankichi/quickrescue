import { Ubicacion } from '../models';

export interface DatosUbicacion {
  latitud: number;
  longitud: number;
  precision_m?: number;
}

export const reportar = (uid: number, datos: DatosUbicacion) =>
  Ubicacion.create({
    usuario_id:  uid,
    latitud:     datos.latitud,
    longitud:    datos.longitud,
    precision_m: datos.precision_m ?? null,
  });

export const listar = (uid: number, limit = 50) =>
  Ubicacion.findAll({
    where: { usuario_id: uid },
    order: [['timestamp', 'DESC']],
    limit: Math.min(Math.max(limit, 1), 200),
  });
