import { body, param, query } from 'express-validator';

/**
 * Esquemas de validación express-validator. Se consumen vía el middleware
 * `validar([...])` de middleware/validation.middleware.ts.
 */

export const validarRegistro = [
  body('nombre')   .trim().notEmpty().withMessage('Requerido')
                   .isLength({ max: 80 }),
  body('apellido') .trim().notEmpty().withMessage('Requerido')
                   .isLength({ max: 80 }),
  body('email')    .trim().notEmpty().isEmail()
                   .withMessage('Email inválido').normalizeEmail(),
  body('password') .isLength({ min: 8 })
                   .withMessage('Mínimo 8 caracteres'),
  body('dni')      .optional().isLength({ min: 6, max: 15 }),
  body('fecha_nacimiento').optional().isISO8601()
                   .withMessage('Formato YYYY-MM-DD'),
];

export const validarLogin = [
  body('email')   .trim().notEmpty().isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

export const validarActualizarUsuario = [
  body('nombre')   .optional().trim().isLength({ min: 1, max: 80 }),
  body('apellido') .optional().trim().isLength({ min: 1, max: 80 }),
  body('dni')      .optional().isLength({ min: 6, max: 15 }),
  body('fecha_nacimiento').optional().isISO8601(),
  body('foto')     .optional().isString().isLength({ max: 255 }),
  body('direccion').optional().isString().isLength({ max: 200 }),
  body('distrito') .optional().isString().isLength({ max: 60 }),
  body('provincia').optional().isString().isLength({ max: 60 }),
];

export const validarFamiliar = [
  body('nombre')   .trim().notEmpty().isLength({ max: 120 }),
  body('telefono') .trim().notEmpty().isLength({ max: 20 }),
  body('email')    .optional({ checkFalsy: true }).isEmail().normalizeEmail(),
  body('relacion') .trim().notEmpty().isLength({ max: 40 }),
];

export const validarFamiliarParcial = [
  body('nombre')   .optional().trim().isLength({ min: 1, max: 120 }),
  body('telefono') .optional().trim().isLength({ min: 1, max: 20 }),
  body('email')    .optional({ checkFalsy: true }).isEmail().normalizeEmail(),
  body('relacion') .optional().trim().isLength({ min: 1, max: 40 }),
];

const ESPECIES_MASCOTA = ['perro', 'gato', 'otro'];

export const validarMascota = [
  body('nombre')          .trim().notEmpty().isLength({ max: 80 }),
  body('especie')         .trim().notEmpty().isIn(ESPECIES_MASCOTA)
                          .withMessage('Especie debe ser perro, gato u otro'),
  body('raza')            .optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 60 }),
  body('color')           .optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 40 }),
  body('edad_anios')      .optional({ nullable: true }).isInt({ min: 0, max: 60 }),
  body('foto')            .optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 255 }),
  body('microchip')       .optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 40 }),
  body('perdida')         .optional().isBoolean(),
  body('mensaje_perdida') .optional({ nullable: true }).isString(),
];

export const validarMascotaParcial = [
  body('nombre')          .optional().trim().isLength({ min: 1, max: 80 }),
  body('especie')         .optional().trim().isIn(ESPECIES_MASCOTA)
                          .withMessage('Especie debe ser perro, gato u otro'),
  body('raza')            .optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 60 }),
  body('color')           .optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 40 }),
  body('edad_anios')      .optional({ nullable: true }).isInt({ min: 0, max: 60 }),
  body('foto')            .optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 255 }),
  body('microchip')       .optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 40 }),
  body('perdida')         .optional().isBoolean(),
  body('mensaje_perdida') .optional({ nullable: true }).isString(),
];

export const validarHistorial = [
  body('alergias')        .optional({ nullable: true }).isString(),
  body('enfermedades')    .optional({ nullable: true }).isString(),
  body('operaciones')     .optional({ nullable: true }).isString(),
  body('medicamentos')    .optional({ nullable: true }).isString(),
  body('grupo_sanguineo') .optional({ nullable: true }).isString().isLength({ max: 5 }),
];

export const validarUbicacion = [
  body('latitud')    .isFloat({ min: -90,  max: 90 }).withMessage('Latitud inválida'),
  body('longitud')   .isFloat({ min: -180, max: 180 }).withMessage('Longitud inválida'),
  body('precision_m').optional().isInt({ min: 0, max: 10000 }),
];

export const validarIdParam = [
  param('id').isInt({ min: 1 }).withMessage('ID inválido'),
];

const PRODUCTOS_QR    = ['collar', 'pulsera', 'llavero'];
const DESTINATARIO_QR = ['usuario', 'familiar', 'mascota'];

export const validarCompra = [
  body('producto')          .isIn(PRODUCTOS_QR).withMessage('Producto inválido'),
  body('destinatario_tipo') .isIn(DESTINATARIO_QR).withMessage('Destinatario inválido'),
  body('destinatario_id')   .isInt({ min: 1 }).withMessage('destinatario_id inválido'),
  body('notas')             .optional({ nullable: true }).isString().isLength({ max: 1000 }),
];

export const validarLimitQuery = [
  query('limit').optional().isInt({ min: 1, max: 200 }),
];
