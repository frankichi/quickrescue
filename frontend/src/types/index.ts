export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  dni: string | null;
  email: string;
  foto: string | null;
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
  telefono: string;
  email: string | null;
  relacion: string;
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

export interface ContactoTitular {
  nombre_titular: string;
  telefono: string | null;
  relacion: string | null;
  familiares: Array<{ nombre: string; telefono: string; relacion: string }>;
}

export interface PerfilPublico {
  tipo: TipoQR;
  id: number;
  titular_id: number;
  nombre: string;
  subtitulo: string;
  foto: string | null;
  grupo_sanguineo?: string | null;
  alergias?: string | null;
  enfermedades?: string | null;
  medicamentos?: string | null;
  microchip?: string | null;
  perdida?: boolean;
  mensaje_perdida?: string | null;
  contacto: ContactoTitular;
}

export interface Escaneo {
  id: number;
  tipo: TipoQR;
  referencia_id: number;
  nombre_referencia: string;
  latitud: number | null;
  longitud: number | null;
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
