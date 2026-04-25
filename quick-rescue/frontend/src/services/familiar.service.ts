import { api } from './api';
import { Familiar, ApiResponse } from '../types';

export const listar = async (): Promise<Familiar[]> => {
  const { data } = await api.get<ApiResponse<Familiar[]>>('/familiares');
  return data.data!;
};

export const crear = async (payload: Omit<Familiar, 'id' | 'usuario_id' | 'creado_en'>): Promise<Familiar> => {
  const { data } = await api.post<ApiResponse<Familiar>>('/familiares', payload);
  return data.data!;
};

export const actualizar = async (id: number, payload: Partial<Familiar>): Promise<Familiar> => {
  const { data } = await api.put<ApiResponse<Familiar>>(`/familiares/${id}`, payload);
  return data.data!;
};

export const eliminar = async (id: number): Promise<void> => {
  await api.delete(`/familiares/${id}`);
};
