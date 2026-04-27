import { Escaneo, Familiar, Mascota, Usuario } from '../models';

/**
 * Lista el histórico de escaneos del titular, ordenado de más reciente a
 * más antiguo. Enriquece cada registro con el nombre de la entidad
 * referenciada (familiar/mascota/usuario) para que el frontend no tenga
 * que hacer lookups extra.
 */
export const listarDelTitular = async (titularId: number, limit = 100) => {
  const escaneos = await Escaneo.findAll({
    where: { titular_id: titularId },
    order: [['creado_en', 'DESC']],
    limit,
  });

  if (escaneos.length === 0) return [];

  // Cargar referencias en lote por tipo
  const idsPorTipo = {
    usuario:  new Set<number>(),
    familiar: new Set<number>(),
    mascota:  new Set<number>(),
  };
  for (const e of escaneos) idsPorTipo[e.tipo].add(e.referencia_id);

  const [usuarios, familiares, mascotas] = await Promise.all([
    Usuario.findAll({ where: { id: [...idsPorTipo.usuario] } }),
    Familiar.findAll({ where: { id: [...idsPorTipo.familiar] } }),
    Mascota.findAll({ where: { id: [...idsPorTipo.mascota] } }),
  ]);

  const mapaUsuario  = new Map(usuarios.map(u => [u.id, `${u.nombre} ${u.apellido}`]));
  const mapaFamiliar = new Map(familiares.map(f => [f.id, f.nombre]));
  const mapaMascota  = new Map(mascotas.map(m => [m.id, m.nombre]));

  return escaneos.map((e) => {
    const nombre =
      e.tipo === 'usuario'  ? mapaUsuario.get(e.referencia_id)  ?? '(eliminado)' :
      e.tipo === 'familiar' ? mapaFamiliar.get(e.referencia_id) ?? '(eliminado)' :
                              mapaMascota.get(e.referencia_id)  ?? '(eliminado)';
    return {
      id:            e.id,
      tipo:          e.tipo,
      referencia_id: e.referencia_id,
      nombre_referencia: nombre,
      latitud:       e.latitud,
      longitud:      e.longitud,
      creado_en:     e.creado_en,
    };
  });
};
