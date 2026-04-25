import { Request, Response } from 'express';
import * as service from '../services/usuario.service';

export const obtenerMiPerfil = async (req: Request, res: Response): Promise<void> => {
  const data = await service.obtenerMiPerfil(req.user!.uid);
  res.json({ success: true, data });
};

export const actualizarMiPerfil = async (req: Request, res: Response): Promise<void> => {
  const data = await service.actualizarMiPerfil(req.user!.uid, req.body);
  res.json({ success: true, data });
};

export const eliminarMiCuenta = async (req: Request, res: Response): Promise<void> => {
  const data = await service.eliminarMiCuenta(req.user!.uid);
  res.json({ success: true, data });
};
