import { Router } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import { autenticar } from '../middleware/auth.middleware';
import { validar } from '../middleware/validation.middleware';
import { validarSOS } from '../validators';
import * as ctrl from '../controllers/sos.controller';

const router = Router();
router.use(autenticar);

router.post('/', validar(validarSOS), asyncHandler(ctrl.disparar));

export default router;
