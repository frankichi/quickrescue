import { Request, Response } from 'express';
import * as service from '../services/mascota.service';

export const listar = async (req: Request, res: Response): Promise<void> => {
  const data = await service.listar(req.user!.uid);
  res.json({ success: true, data });
};

export const crear = async (req: Request, res: Response): Promise<void> => {
  const data = await service.crear(req.user!.uid, req.body);
  res.status(201).json({ success: true, data });
};

export const actualizar = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const data = await service.actualizar(req.user!.uid, id, req.body);
  res.json({ success: true, data });
};

export const eliminar = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const data = await service.eliminar(req.user!.uid, id);
  res.json({ success: true, data });
};
