import { Request, Response } from 'express';
import * as service from '../services/historial.service';

export const obtener = async (req: Request, res: Response): Promise<void> => {
  const data = await service.obtener(req.user!.uid);
  res.json({ success: true, data });
};

export const actualizar = async (req: Request, res: Response): Promise<void> => {
  const data = await service.actualizar(req.user!.uid, req.body);
  res.json({ success: true, data });
};
