import { Request, Response } from 'express';
import * as service from '../services/compra.service';

export const listarCatalogo = (_req: Request, res: Response): void => {
  res.json({ success: true, data: service.listarCatalogo() });
};

export const crear = async (req: Request, res: Response): Promise<void> => {
  const compra = await service.crearCompra(req.user!.uid, req.body);
  res.status(201).json({ success: true, data: compra });
};

export const listarMias = async (req: Request, res: Response): Promise<void> => {
  const data = await service.listarCompras(req.user!.uid);
  res.json({ success: true, data });
};
