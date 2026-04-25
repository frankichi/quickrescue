import { Router } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import { autenticar } from '../middleware/auth.middleware';
import { validar } from '../middleware/validation.middleware';
import { validarActualizarUsuario, validarIdParam } from '../validators';
import * as ctrl from '../controllers/usuario.controller';

const router = Router();

// Endpoint público (sin auth): perfil mínimo expuesto al escanear el QR.
// Debe declararse ANTES del middleware `autenticar` para no exigir token.
router.get('/:id/publico',
  validar(validarIdParam),
  asyncHandler(ctrl.obtenerPerfilPublico),
);

router.use(autenticar);

router.get   ('/me', asyncHandler(ctrl.obtenerMiPerfil));
router.put   ('/me', validar(validarActualizarUsuario), asyncHandler(ctrl.actualizarMiPerfil));
router.delete('/me', asyncHandler(ctrl.eliminarMiCuenta));

export default router;
