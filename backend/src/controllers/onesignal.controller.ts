import { Request, Response } from 'express';
import * as service from '../services/onesignal.service';

export const guardarSubscription = async (req: Request, res: Response): Promise<void> => {
  const { subscription_id } = req.body as { subscription_id: string };
  await service.guardarSubscription(req.user!.uid, subscription_id);
  res.json({ success: true, data: { vinculado: true } });
};

export const removerSubscription = async (req: Request, res: Response): Promise<void> => {
  await service.removerSubscription(req.user!.uid);
  res.json({ success: true, data: { vinculado: false } });
};
