import { Router } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import { autenticar } from '../middleware/auth.middleware';
import { validar } from '../middleware/validation.middleware';
import { validarUbicacion, validarLimitQuery } from '../validators';
import * as ctrl from '../controllers/ubicacion.controller';

const router = Router();
router.use(autenticar);

router.get ('/', validar(validarLimitQuery), asyncHandler(ctrl.listar));
router.post('/', validar(validarUbicacion),  asyncHandler(ctrl.reportar));

export default router;
