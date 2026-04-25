import { Router } from 'express';
import authRoutes      from './auth.routes';
import usuarioRoutes   from './usuario.routes';
import familiarRoutes  from './familiar.routes';
import mascotaRoutes   from './mascota.routes';
import historialRoutes from './historial.routes';
import ubicacionRoutes from './ubicacion.routes';
import sosRoutes       from './sos.routes';

const api = Router();

// Healthcheck (sin auth)
api.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

api.use('/auth',             authRoutes);
api.use('/usuarios',         usuarioRoutes);
api.use('/familiares',       familiarRoutes);
api.use('/mascotas',         mascotaRoutes);
api.use('/historial-medico', historialRoutes);
api.use('/ubicaciones',      ubicacionRoutes);
api.use('/sos',              sosRoutes);

export default api;
