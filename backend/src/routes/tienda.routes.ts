import { Router } from 'express';
import * as ctrl from '../controllers/compra.controller';

/** Catálogo público (sin auth). Las compras viven en /compras (con auth). */
const router = Router();
router.get('/productos', ctrl.listarCatalogo);
export default router;
