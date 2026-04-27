import { Router } from 'express';
import multer from 'multer';
import { asyncHandler } from '../middleware/error.middleware';
import { autenticar } from '../middleware/auth.middleware';
import * as ctrl from '../controllers/foto.controller';

const FORMATOS = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (FORMATOS.has(file.mimetype)) cb(null, true);
    else cb(new Error('Formato no permitido. Usa jpeg, png o webp.'));
  },
});

const router = Router();
router.use(autenticar);

router.post('/usuario/me',     upload.single('foto'), asyncHandler(ctrl.subirFotoUsuario));
router.post('/familiar/:id',   upload.single('foto'), asyncHandler(ctrl.subirFotoFamiliar));
router.post('/mascota/:id',    upload.single('foto'), asyncHandler(ctrl.subirFotoMascota));

export default router;
