import { Router } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import { autenticar } from '../middleware/auth.middleware';
import { validar } from '../middleware/validation.middleware';
import { validarRegistro, validarLogin } from '../validators';
import * as ctrl from '../controllers/auth.controller';

const router = Router();

router.post('/register', validar(validarRegistro), asyncHandler(ctrl.registrar));
router.post('/login',    validar(validarLogin),    asyncHandler(ctrl.login));
router.get ('/me',       autenticar,               asyncHandler(ctrl.me));

export default router;
