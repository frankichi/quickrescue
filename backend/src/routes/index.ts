import { Router } from 'express';
import authRoutes      from './auth.routes';
import usuarioRoutes   from './usuario.routes';
import familiarRoutes  from './familiar.routes';
import mascotaRoutes   from './mascota.routes';
import historialRoutes from './historial.routes';
import ubicacionRoutes from './ubicacion.routes';
import qrRoutes        from './qr.routes';
import escaneosRoutes  from './escaneos.routes';
import fotoRoutes      from './foto.routes';
import compraRoutes    from './compra.routes';
import tiendaRoutes    from './tienda.routes';

const api = Router();

// Healthcheck (sin auth)
api.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// Públicas (sin auth)
api.use('/qr',     qrRoutes);     // /qr/:tipo/:id/{publico,escaneo}
api.use('/tienda', tiendaRoutes); // /tienda/productos

// Privadas (con JWT)
api.use('/auth',             authRoutes);
api.use('/usuarios',         usuarioRoutes);
api.use('/familiares',       familiarRoutes);
api.use('/mascotas',         mascotaRoutes);
api.use('/historial-medico', historialRoutes);
api.use('/ubicaciones',      ubicacionRoutes);
api.use('/escaneos',         escaneosRoutes);
api.use('/fotos',            fotoRoutes);
api.use('/compras',          compraRoutes);

export default api;
