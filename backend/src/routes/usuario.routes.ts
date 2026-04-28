import { Router } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import { autenticar } from '../middleware/auth.middleware';
import { validar } from '../middleware/validation.middleware';
import { validarActualizarUsuario, validarSubscriptionOneSignal } from '../validators';
import * as ctrl from '../controllers/usuario.controller';
import * as oneSignalCtrl from '../controllers/onesignal.controller';

const router = Router();
router.use(autenticar);

router.get   ('/me', asyncHandler(ctrl.obtenerMiPerfil));
router.put   ('/me', validar(validarActualizarUsuario), asyncHandler(ctrl.actualizarMiPerfil));
router.delete('/me', asyncHandler(ctrl.eliminarMiCuenta));

router.post  ('/me/onesignal-subscription',
  validar(validarSubscriptionOneSignal),
  asyncHandler(oneSignalCtrl.guardarSubscription),
);
router.delete('/me/onesignal-subscription',
  asyncHandler(oneSignalCtrl.removerSubscription),
);

export default router;
