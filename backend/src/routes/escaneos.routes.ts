import { Router } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import { autenticar } from '../middleware/auth.middleware';
import { validar } from '../middleware/validation.middleware';
import { validarLimitQuery } from '../validators';
import * as ctrl from '../controllers/escaneos.controller';

const router = Router();
router.use(autenticar);

router.get('/', validar(validarLimitQuery), asyncHandler(ctrl.listarMios));

export default router;
