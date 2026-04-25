import { Request, Response } from 'express';
import * as service from '../services/ubicacion.service';

export const reportar = async (req: Request, res: Response): Promise<void> => {
  const data = await service.reportar(req.user!.uid, req.body);
  res.status(201).json({ success: true, data });
};

export const listar = async (req: Request, res: Response): Promise<void> => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
  const data = await service.listar(req.user!.uid, limit);
  res.json({ success: true, data });
};
