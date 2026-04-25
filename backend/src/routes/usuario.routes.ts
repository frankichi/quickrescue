import { Router } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import { autenticar } from '../middleware/auth.middleware';
import { validar } from '../middleware/validation.middleware';
import { validarActualizarUsuario } from '../validators';
import * as ctrl from '../controllers/usuario.controller';

const router = Router();
router.use(autenticar);

router.get   ('/me', asyncHandler(ctrl.obtenerMiPerfil));
router.put   ('/me', validar(validarActualizarUsuario), asyncHandler(ctrl.actualizarMiPerfil));
router.delete('/me', asyncHandler(ctrl.eliminarMiCuenta));

export default router;
