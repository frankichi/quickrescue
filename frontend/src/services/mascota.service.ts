import { api } from './api';
import { Mascota, ApiResponse } from '../types';

/**
 * Campos que el usuario puede mandar al crear/actualizar una mascota.
 * `foto` se sube por endpoint aparte (foto.service). `microchip` se
 * mantiene en DB pero ya no se expone en la UI desde Fase 1.5.
 */
export interface MascotaInput {
  nombre: string;
  especie: Mascota['especie'];
  raza?: string | null;
  color?: string | null;
  edad_anios?: number | null;
  perdida?: boolean;
  mensaje_perdida?: string | null;
}

export const listar = async (): Promise<Mascota[]> => {
  const { data } = await api.get<ApiResponse<Mascota[]>>('/mascotas');
  return data.data!;
};

export const crear = async (payload: MascotaInput): Promise<Mascota> => {
  const { data } = await api.post<ApiResponse<Mascota>>('/mascotas', payload);
  return data.data!;
};

export const actualizar = async (id: number, payload: Partial<MascotaInput>): Promise<Mascota> => {
  const { data } = await api.put<ApiResponse<Mascota>>(`/mascotas/${id}`, payload);
  return data.data!;
};

export const eliminar = async (id: number): Promise<void> => {
  await api.delete(`/mascotas/${id}`);
};
