import { api } from './api';
import { Familiar, ApiResponse } from '../types';

/**
 * Campos que el usuario puede mandar al crear/actualizar un familiar.
 * `foto` se sube por endpoint aparte (foto.service); el resto de los
 * campos médicos y de dirección son opcionales.
 */
export interface FamiliarInput {
  nombre: string;
  apellido?: string | null;
  dni?: string | null;
  fecha_nacimiento?: string | null;
  telefono: string;
  email?: string | null;
  relacion: string;
  direccion?: string | null;
  distrito?: string | null;
  provincia?: string | null;
  grupo_sanguineo?: string | null;
  alergias?: string | null;
  enfermedades?: string | null;
  operaciones?: string | null;
  medicamentos?: string | null;
}

export const listar = async (): Promise<Familiar[]> => {
  const { data } = await api.get<ApiResponse<Familiar[]>>('/familiares');
  return data.data!;
};

export const crear = async (payload: FamiliarInput): Promise<Familiar> => {
  const { data } = await api.post<ApiResponse<Familiar>>('/familiares', payload);
  return data.data!;
};

export const actualizar = async (id: number, payload: Partial<FamiliarInput>): Promise<Familiar> => {
  const { data } = await api.put<ApiResponse<Familiar>>(`/familiares/${id}`, payload);
  return data.data!;
};

export const eliminar = async (id: number): Promise<void> => {
  await api.delete(`/familiares/${id}`);
};
