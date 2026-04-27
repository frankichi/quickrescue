import { Router } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import { autenticar } from '../middleware/auth.middleware';
import { validar } from '../middleware/validation.middleware';
import { validarCompra } from '../validators';
import * as ctrl from '../controllers/compra.controller';

/**
 * /tienda/productos es PÚBLICO (catálogo). El resto requiere auth.
 * Para mantener una sola ruta de Express, la pública se monta separada
 * en routes/index.ts antes de pasar por autenticar.
 */
const router = Router();
router.use(autenticar);

router.post('/', validar(validarCompra), asyncHandler(ctrl.crear));
router.get ('/',                          asyncHandler(ctrl.listarMias));

export default router;
