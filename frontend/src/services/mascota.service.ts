import { api } from './api';
import { Mascota, ApiResponse } from '../types';

export type MascotaInput = Omit<Mascota, 'id' | 'usuario_id' | 'creado_en' | 'actualizado_en'>;

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
