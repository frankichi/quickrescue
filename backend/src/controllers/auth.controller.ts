import { Request, Response } from 'express';
import * as authService from '../services/auth.service';

export const registrar = async (req: Request, res: Response): Promise<void> => {
  const data = await authService.registrar(req.body);
  res.status(201).json({ success: true, data });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const data = await authService.login(email, password);
  res.json({ success: true, data });
};

export const me = async (req: Request, res: Response): Promise<void> => {
  const usuario = await authService.obtenerPorId(req.user!.uid);
  res.json({ success: true, data: usuario });
};
