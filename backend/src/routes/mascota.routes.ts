import { Router } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import { autenticar } from '../middleware/auth.middleware';
import { validar } from '../middleware/validation.middleware';
import { validarMascota, validarMascotaParcial, validarIdParam } from '../validators';
import * as ctrl from '../controllers/mascota.controller';

const router = Router();
router.use(autenticar);

router.get   ('/',    asyncHandler(ctrl.listar));
router.post  ('/',    validar(validarMascota), asyncHandler(ctrl.crear));
router.put   ('/:id', validar([...validarIdParam, ...validarMascotaParcial]), asyncHandler(ctrl.actualizar));
router.delete('/:id', validar(validarIdParam), asyncHandler(ctrl.eliminar));

export default router;
