import { Router } from 'express';
import authRoutes      from './auth.routes';
import usuarioRoutes   from './usuario.routes';
import familiarRoutes  from './familiar.routes';
import mascotaRoutes   from './mascota.routes';
import historialRoutes from './historial.routes';
import ubicacionRoutes from './ubicacion.routes';
import qrRoutes        from './qr.routes';
import escaneosRoutes  from './escaneos.routes';

const api = Router();

// Healthcheck (sin auth)
api.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// Públicas (sin auth) — usadas por transeúntes que escanean el QR físico.
api.use('/qr',               qrRoutes);

// Privadas (con JWT)
api.use('/auth',             authRoutes);
api.use('/usuarios',         usuarioRoutes);
api.use('/familiares',       familiarRoutes);
api.use('/mascotas',         mascotaRoutes);
api.use('/historial-medico', historialRoutes);
api.use('/ubicaciones',      ubicacionRoutes);
api.use('/escaneos',         escaneosRoutes);

export default api;
