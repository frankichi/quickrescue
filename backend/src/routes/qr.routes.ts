import { Router } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import * as ctrl from '../controllers/qr.controller';

/**
 * Rutas PÚBLICAS de QR (sin autenticación). Las usa el transeúnte que
 * escanea el QR físico desde la cámara nativa del celular.
 */
const router = Router();

router.get ('/:tipo/:id/publico', asyncHandler(ctrl.obtenerPerfilPublico));
router.post('/:tipo/:id/escaneo', asyncHandler(ctrl.registrarEscaneo));

export default router;
