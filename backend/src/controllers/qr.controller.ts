import { Request, Response } from 'express';
import * as service from '../services/qr.service';
import { AppError } from '../utils/AppError';
import type { TipoEscaneo } from '../models/escaneo.model';

const parseTipoYId = (req: Request): { tipo: TipoEscaneo; id: number } => {
  const tipo = req.params.tipo;
  const id   = parseInt(req.params.id, 10);
  if (!service.esTipoValido(tipo)) throw new AppError('Tipo de QR inválido', 400);
  if (!Number.isInteger(id) || id < 1) throw new AppError('ID inválido', 400);
  return { tipo, id };
};

export const obtenerPerfilPublico = async (req: Request, res: Response): Promise<void> => {
  const { tipo, id } = parseTipoYId(req);
  const data = await service.resolverQR(tipo, id);
  res.json({ success: true, data });
};

export const registrarEscaneo = async (req: Request, res: Response): Promise<void> => {
  const { tipo, id } = parseTipoYId(req);
  const lat = req.body?.latitud;
  const lon = req.body?.longitud;
  const data = await service.registrarEscaneo({
    tipo,
    referencia_id: id,
    latitud:  typeof lat === 'number' ? lat : null,
    longitud: typeof lon === 'number' ? lon : null,
    ip:         req.ip ?? null,
    user_agent: req.headers['user-agent'] ?? null,
  });
  res.status(201).json({ success: true, data });
};
