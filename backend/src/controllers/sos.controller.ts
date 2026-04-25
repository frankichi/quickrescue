import { Request, Response } from 'express';
import * as service from '../services/sos.service';

export const disparar = async (req: Request, res: Response): Promise<void> => {
  const data = await service.dispararSOS(req.user!.uid, req.body);
  res.json({ success: true, data });
};
