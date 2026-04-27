import { Request, Response } from 'express';
import { Familiar, Mascota, Usuario } from '../models';
import { AppError } from '../utils/AppError';
import { subirFoto } from '../services/foto.service';

const requireFile = (req: Request) => {
  const file = (req as Request & { file?: Express.Multer.File }).file;
  if (!file) throw new AppError('No se recibió archivo (campo "foto")', 400);
  return file;
};

const subirYActualizar = async (
  buffer: Buffer,
  filename: string,
  carpeta: string,
  guardar: (url: string) => Promise<void>,
): Promise<string> => {
  const url = await subirFoto(buffer, filename, carpeta);
  await guardar(url);
  return url;
};

export const subirFotoUsuario = async (req: Request, res: Response): Promise<void> => {
  const file = requireFile(req);
  const uid  = req.user!.uid;
  const url = await subirYActualizar(
    file.buffer,
    `usuario_${uid}_${Date.now()}`,
    'quickrescue/usuarios',
    async (u) => {
      const usuario = await Usuario.findByPk(uid);
      if (!usuario) throw new AppError('Usuario no encontrado', 404);
      usuario.foto = u;
      usuario.actualizado_en = new Date();
      await usuario.save();
    },
  );
  res.status(201).json({ success: true, data: { url } });
};

export const subirFotoFamiliar = async (req: Request, res: Response): Promise<void> => {
  const file = requireFile(req);
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id < 1) throw new AppError('ID inválido', 400);
  const familiar = await Familiar.findOne({ where: { id, usuario_id: req.user!.uid } });
  if (!familiar) throw new AppError('Familiar no encontrado', 404);
  const url = await subirYActualizar(
    file.buffer,
    `familiar_${id}_${Date.now()}`,
    'quickrescue/familiares',
    async (u) => {
      familiar.foto = u;
      await familiar.save();
    },
  );
  res.status(201).json({ success: true, data: { url } });
};

export const subirFotoMascota = async (req: Request, res: Response): Promise<void> => {
  const file = requireFile(req);
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id < 1) throw new AppError('ID inválido', 400);
  const mascota = await Mascota.findOne({ where: { id, usuario_id: req.user!.uid } });
  if (!mascota) throw new AppError('Mascota no encontrada', 404);
  const url = await subirYActualizar(
    file.buffer,
    `mascota_${id}_${Date.now()}`,
    'quickrescue/mascotas',
    async (u) => {
      mascota.foto = u;
      await mascota.save();
    },
  );
  res.status(201).json({ success: true, data: { url } });
};
