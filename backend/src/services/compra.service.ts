import { Compra, Familiar, Mascota, Usuario } from '../models';
import { AppError } from '../utils/AppError';
import type { ProductoQR, DestinatarioTipo } from '../models/compra.model';

export interface ProductoCatalogo {
  id: ProductoQR;
  nombre: string;
  precio: number;
  descripcion: string;
}

export const PRODUCTOS: Record<ProductoQR, ProductoCatalogo> = {
  collar:  { id: 'collar',  nombre: 'Collar QR',  precio: 35.00, descripcion: 'Collar de resina con código QR' },
  pulsera: { id: 'pulsera', nombre: 'Pulsera QR', precio: 45.00, descripcion: 'Pulsera ajustable con código QR' },
  llavero: { id: 'llavero', nombre: 'Llavero QR', precio: 25.00, descripcion: 'Llavero metálico con código QR' },
};

export const listarCatalogo = (): ProductoCatalogo[] => Object.values(PRODUCTOS);

const verificarDestinatario = async (
  uid: number,
  tipo: DestinatarioTipo,
  destinatarioId: number,
): Promise<void> => {
  if (tipo === 'usuario') {
    if (destinatarioId !== uid) {
      throw new AppError('El destinatario "usuario" debe ser el propio titular', 403);
    }
    return;
  }
  if (tipo === 'familiar') {
    const f = await Familiar.findByPk(destinatarioId);
    if (!f || f.usuario_id !== uid) {
      throw new AppError('Familiar no encontrado o no es tuyo', 404);
    }
    return;
  }
  // mascota
  const m = await Mascota.findByPk(destinatarioId);
  if (!m || m.usuario_id !== uid) {
    throw new AppError('Mascota no encontrada o no es tuya', 404);
  }
};

export interface DatosCompra {
  producto: ProductoQR;
  destinatario_tipo: DestinatarioTipo;
  destinatario_id: number;
  notas?: string | null;
}

export const crearCompra = async (uid: number, datos: DatosCompra) => {
  const cat = PRODUCTOS[datos.producto];
  if (!cat) throw new AppError('Producto inválido', 400);
  await verificarDestinatario(uid, datos.destinatario_tipo, datos.destinatario_id);

  return Compra.create({
    usuario_id:        uid,
    producto:          datos.producto,
    destinatario_tipo: datos.destinatario_tipo,
    destinatario_id:   datos.destinatario_id,
    precio:            cat.precio,
    notas:             datos.notas ?? null,
  });
};

/**
 * Lista todas las compras del titular, enriquecidas con el nombre del
 * destinatario (usuario, familiar o mascota) para evitar lookups en el
 * frontend.
 */
export const listarCompras = async (uid: number) => {
  const compras = await Compra.findAll({
    where: { usuario_id: uid },
    order: [['creado_en', 'DESC']],
  });
  if (compras.length === 0) return [];

  const idsPorTipo = {
    usuario:  new Set<number>(),
    familiar: new Set<number>(),
    mascota:  new Set<number>(),
  };
  for (const c of compras) idsPorTipo[c.destinatario_tipo].add(c.destinatario_id);

  const [usuarios, familiares, mascotas] = await Promise.all([
    Usuario.findAll({ where: { id: [...idsPorTipo.usuario] } }),
    Familiar.findAll({ where: { id: [...idsPorTipo.familiar] } }),
    Mascota.findAll({ where: { id: [...idsPorTipo.mascota] } }),
  ]);

  const mapaUsuario  = new Map(usuarios.map(u => [u.id, `${u.nombre} ${u.apellido}`]));
  const mapaFamiliar = new Map(familiares.map(f => [f.id, f.nombre]));
  const mapaMascota  = new Map(mascotas.map(m => [m.id, m.nombre]));

  return compras.map((c) => ({
    id:                c.id,
    producto:          c.producto,
    producto_nombre:   PRODUCTOS[c.producto].nombre,
    destinatario_tipo: c.destinatario_tipo,
    destinatario_id:   c.destinatario_id,
    destinatario_nombre:
      c.destinatario_tipo === 'usuario'  ? mapaUsuario.get(c.destinatario_id)  ?? '(eliminado)' :
      c.destinatario_tipo === 'familiar' ? mapaFamiliar.get(c.destinatario_id) ?? '(eliminado)' :
                                           mapaMascota.get(c.destinatario_id)  ?? '(eliminado)',
    precio:            Number(c.precio),
    estado:            c.estado,
    notas:             c.notas,
    creado_en:         c.creado_en,
  }));
};
