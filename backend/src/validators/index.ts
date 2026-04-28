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

// Permisivo a propósito: acepta + espacios y guiones (p.ej. "+51 987 654 321").
const REGEX_TELEFONO = /^[+0-9 \-()]{6,20}$/;

export const validarActualizarUsuario = [
  body('nombre')   .optional().trim().isLength({ min: 1, max: 80 }),
  body('apellido') .optional().trim().isLength({ min: 1, max: 80 }),
  body('dni')      .optional({ nullable: true, checkFalsy: true }).isLength({ min: 6, max: 15 }),
  body('fecha_nacimiento').optional({ nullable: true, checkFalsy: true }).isISO8601(),
  body('foto')     .optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 500 }),
  body('telefono') .optional({ nullable: true, checkFalsy: true }).isString().matches(REGEX_TELEFONO)
                   .withMessage('Teléfono inválido'),
  body('direccion').optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 200 }),
  body('distrito') .optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 60 }),
  body('provincia').optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 60 }),
];

// Reglas comunes para los campos extendidos del familiar (todas opcionales).
const reglasFamiliarExtendido = [
  body('apellido')        .optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 80 }),
  body('dni')             .optional({ nullable: true, checkFalsy: true }).isString().isLength({ min: 6, max: 15 }),
  body('fecha_nacimiento').optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage('Formato YYYY-MM-DD'),
  body('foto')            .optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 500 }),
  body('direccion')       .optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 200 }),
  body('distrito')        .optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 60 }),
  body('provincia')       .optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 60 }),
  body('grupo_sanguineo') .optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 5 }),
  body('alergias')        .optional({ nullable: true, checkFalsy: true }).isString(),
  body('enfermedades')    .optional({ nullable: true, checkFalsy: true }).isString(),
  body('operaciones')     .optional({ nullable: true, checkFalsy: true }).isString(),
  body('medicamentos')    .optional({ nullable: true, checkFalsy: true }).isString(),
];

export const validarFamiliar = [
  body('nombre')   .trim().notEmpty().isLength({ max: 120 }),
  body('telefono') .trim().notEmpty().isLength({ max: 20 }).matches(REGEX_TELEFONO)
                   .withMessage('Teléfono inválido'),
  body('email')    .optional({ nullable: true, checkFalsy: true }).isEmail().normalizeEmail(),
  body('relacion') .trim().notEmpty().isLength({ max: 40 }),
  ...reglasFamiliarExtendido,
];

export const validarFamiliarParcial = [
  body('nombre')   .optional().trim().isLength({ min: 1, max: 120 }),
  body('telefono') .optional().trim().isLength({ min: 1, max: 20 }).matches(REGEX_TELEFONO)
                   .withMessage('Teléfono inválido'),
  body('email')    .optional({ nullable: true, checkFalsy: true }).isEmail().normalizeEmail(),
  body('relacion') .optional().trim().isLength({ min: 1, max: 40 }),
  ...reglasFamiliarExtendido,
];

const ESPECIES_MASCOTA = ['perro', 'gato', 'otro'];

// Campos opcionales comunes (médicos + microchip legacy + foto subida aparte).
const reglasMascotaOpcionales = [
  body('raza')            .optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 60 }),
  body('color')           .optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 40 }),
  body('edad_anios')      .optional({ nullable: true }).isInt({ min: 0, max: 60 }),
  body('foto')            .optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 500 }),
  body('microchip')       .optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 40 }),
  body('perdida')         .optional().isBoolean(),
  body('mensaje_perdida') .optional({ nullable: true, checkFalsy: true }).isString(),
  body('alergias')        .optional({ nullable: true, checkFalsy: true }).isString(),
  body('medicamentos')    .optional({ nullable: true, checkFalsy: true }).isString(),
  body('condiciones')     .optional({ nullable: true, checkFalsy: true }).isString(),
];

export const validarMascota = [
  body('nombre')          .trim().notEmpty().isLength({ max: 80 }),
  body('especie')         .trim().notEmpty().isIn(ESPECIES_MASCOTA)
                          .withMessage('Especie debe ser perro, gato u otro'),
  ...reglasMascotaOpcionales,
];

export const validarMascotaParcial = [
  body('nombre')          .optional().trim().isLength({ min: 1, max: 80 }),
  body('especie')         .optional().trim().isIn(ESPECIES_MASCOTA)
                          .withMessage('Especie debe ser perro, gato u otro'),
  ...reglasMascotaOpcionales,
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

// El SDK v16 de OneSignal genera un UUID v4 como subscription_id.
export const validarSubscriptionOneSignal = [
  body('subscription_id')
    .isString().withMessage('subscription_id requerido')
    .isUUID(4).withMessage('subscription_id debe ser UUID v4'),
];
