import { Router } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import { autenticar } from '../middleware/auth.middleware';
import { validar } from '../middleware/validation.middleware';
import { validarFamiliar, validarFamiliarParcial, validarIdParam } from '../validators';
import * as ctrl from '../controllers/familiar.controller';

const router = Router();
router.use(autenticar);

router.get   ('/',    asyncHandler(ctrl.listar));
router.post  ('/',    validar(validarFamiliar), asyncHandler(ctrl.crear));
router.put   ('/:id', validar([...validarIdParam, ...validarFamiliarParcial]), asyncHandler(ctrl.actualizar));
router.delete('/:id', validar(validarIdParam), asyncHandler(ctrl.eliminar));

export default router;
