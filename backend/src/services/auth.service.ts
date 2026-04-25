import { Usuario, HistorialMedico } from '../models';
import { hashearPassword, verificarPassword } from '../utils/password';
import { firmarAccessToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';

export interface DatosRegistro {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  dni?: string;
  fecha_nacimiento?: string;
  direccion?: string;
  distrito?: string;
  provincia?: string;
}

const construirRespuesta = (usuario: Usuario) => ({
  usuario: usuario.toJSONSeguro(),
  token: firmarAccessToken({ uid: usuario.id, email: usuario.email }),
});

/**
 * Registra un nuevo usuario y crea su HistorialMedico vacío.
 * Lanza 409 si el email ya existe.
 */
export const registrar = async (datos: DatosRegistro) => {
  const existente = await Usuario.findOne({ where: { email: datos.email } });
  if (existente) {
    throw new AppError('Ese correo ya está registrado', 409);
  }

  const password_hash = await hashearPassword(datos.password);
  const usuario = await Usuario.create({
    nombre:           datos.nombre,
    apellido:         datos.apellido,
    email:            datos.email.toLowerCase(),
    password_hash,
    dni:              datos.dni              ?? null,
    fecha_nacimiento: datos.fecha_nacimiento ? new Date(datos.fecha_nacimiento) : null,
    direccion:        datos.direccion        ?? null,
    distrito:         datos.distrito         ?? null,
    provincia:        datos.provincia        ?? null,
  });

  // Crear historial médico vacío automáticamente
  await HistorialMedico.create({ usuario_id: usuario.id });

  return construirRespuesta(usuario);
};

/**
 * Verifica credenciales y emite token. Mensaje genérico para no filtrar
 * si el email existe o no.
 */
export const login = async (email: string, password: string) => {
  const usuario = await Usuario.findOne({ where: { email: email.toLowerCase() } });
  if (!usuario || !usuario.activo) {
    throw new AppError('Credenciales incorrectas', 401);
  }
  const ok = await verificarPassword(password, usuario.password_hash);
  if (!ok) {
    throw new AppError('Credenciales incorrectas', 401);
  }
  return construirRespuesta(usuario);
};

/** Devuelve datos del usuario por uid (lo usa /auth/me). */
export const obtenerPorId = async (uid: number) => {
  const usuario = await Usuario.findByPk(uid);
  if (!usuario) throw new AppError('Usuario no encontrado', 404);
  return usuario.toJSONSeguro();
};
