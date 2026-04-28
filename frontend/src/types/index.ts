export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  dni: string | null;
  email: string;
  foto: string | null;
  telefono: string | null;
  fecha_nacimiento: string | null;
  direccion: string | null;
  distrito: string | null;
  provincia: string | null;
  creado_en: string;
}

export interface Familiar {
  id: number;
  usuario_id: number;
  nombre: string;
  apellido: string | null;
  dni: string | null;
  fecha_nacimiento: string | null;
  telefono: string;
  email: string | null;
  relacion: string;
  foto: string | null;
  direccion: string | null;
  distrito: string | null;
  provincia: string | null;
  grupo_sanguineo: string | null;
  alergias: string | null;
  enfermedades: string | null;
  operaciones: string | null;
  medicamentos: string | null;
  creado_en: string;
}

export type EspecieMascota = 'perro' | 'gato' | 'otro';

export interface Mascota {
  id: number;
  usuario_id: number;
  nombre: string;
  especie: EspecieMascota;
  raza: string | null;
  color: string | null;
  edad_anios: number | null;
  foto: string | null;
  microchip: string | null;
  perdida: boolean;
  mensaje_perdida: string | null;
  alergias: string | null;
  medicamentos: string | null;
  condiciones: string | null;
  creado_en: string;
  actualizado_en: string;
}

export interface HistorialMedico {
  id: number;
  usuario_id: number;
  alergias: string | null;
  enfermedades: string | null;
  operaciones: string | null;
  medicamentos: string | null;
  grupo_sanguineo: string | null;
  actualizado_en: string;
}

export interface Ubicacion {
  id: number;
  usuario_id: number;
  latitud: number;
  longitud: number;
  precision_m: number | null;
  es_sos: boolean;
  mensaje: string | null;
  timestamp: string;
}

export type TipoQR = 'usuario' | 'familiar' | 'mascota';

export interface ContactoTitularPublico {
  nombre: string;
  telefono: string | null;
  email: string | null;
}

/**
 * Datos médicos en el QR público. Forma única para personas y mascotas;
 * los campos no aplicables a un tipo concreto vienen en `null`.
 */
export interface DatosMedicosPublicos {
  grupo_sanguineo: string | null;
  alergias: string | null;
  enfermedades: string | null;
  operaciones: string | null;
  medicamentos: string | null;
  condiciones: string | null;
}

interface PerfilPublicoBase {
  id: number;
  titular_id: number;
  nombre_completo: string;
  foto_url: string | null;
  datos_medicos: DatosMedicosPublicos;
  contacto_titular: ContactoTitularPublico;
}

export interface PerfilPublicoUsuario extends PerfilPublicoBase {
  tipo: 'usuario';
  edad: number | null;
  dni: string | null;
}

export interface PerfilPublicoFamiliar extends PerfilPublicoBase {
  tipo: 'familiar';
  edad: number | null;
}

export interface PerfilPublicoMascota extends PerfilPublicoBase {
  tipo: 'mascota';
  especie: string;
  raza: string | null;
  color: string | null;
  edad_anios: number | null;
  perdida: boolean;
  mensaje_perdida: string | null;
}

export type PerfilPublico =
  | PerfilPublicoUsuario
  | PerfilPublicoFamiliar
  | PerfilPublicoMascota;

export interface Escaneo {
  id: number;
  tipo: TipoQR;
  referencia_id: number;
  nombre_referencia: string;
  latitud: number | null;
  longitud: number | null;
  direccion: string | null;
  creado_en: string;
}

export type ProductoQR = 'collar' | 'pulsera' | 'llavero';
export type DestinatarioTipo = 'usuario' | 'familiar' | 'mascota';
export type EstadoCompra =
  | 'pendiente' | 'confirmado' | 'enviado' | 'entregado' | 'cancelado';

export interface Producto {
  id: ProductoQR;
  nombre: string;
  precio: number;
  descripcion: string;
}

export interface Compra {
  id: number;
  producto: ProductoQR;
  producto_nombre: string;
  destinatario_tipo: DestinatarioTipo;
  destinatario_id: number;
  destinatario_nombre: string;
  precio: number;
  estado: EstadoCompra;
  notas: string | null;
  creado_en: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: Record<string, string>;
}

export interface AuthData {
  usuario: Usuario;
  token: string;
}
