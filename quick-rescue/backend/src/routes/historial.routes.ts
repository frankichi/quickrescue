import { Router } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import { autenticar } from '../middleware/auth.middleware';
import { validar } from '../middleware/validation.middleware';
import { validarHistorial } from '../validators';
import * as ctrl from '../controllers/historial.controller';

const router = Router();
router.use(autenticar);

router.get('/', asyncHandler(ctrl.obtener));
router.put('/', validar(validarHistorial), asyncHandler(ctrl.actualizar));

export default router;
