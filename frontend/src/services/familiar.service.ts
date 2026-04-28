import { api } from './api';
import { Familiar, ApiResponse } from '../types';

/**
 * Campos que el usuario puede mandar al crear/actualizar un familiar.
 * `foto` se sube por endpoint aparte (foto.service), por eso es opcional.
 */
export type FamiliarInput = {
  nombre: string;
  telefono: string;
  email?: string | null;
  relacion: string;
};

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
