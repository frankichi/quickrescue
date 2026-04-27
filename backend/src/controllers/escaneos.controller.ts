import { Request, Response } from 'express';
import * as service from '../services/escaneos.service';

export const listarMios = async (req: Request, res: Response): Promise<void> => {
  const limitParam = req.query.limit;
  const limit = typeof limitParam === 'string' ? parseInt(limitParam, 10) : undefined;
  const data = await service.listarDelTitular(req.user!.uid,
    Number.isInteger(limit) && limit! > 0 && limit! <= 500 ? limit : 100);
  res.json({ success: true, data });
};
