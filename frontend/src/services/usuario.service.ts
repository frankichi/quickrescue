import { api } from './api';
import { Usuario, ApiResponse } from '../types';

export const obtenerMiPerfil = async (): Promise<Usuario> => {
  const { data } = await api.get<ApiResponse<Usuario>>('/usuarios/me');
  return data.data!;
};

export const actualizarMiPerfil = async (payload: Partial<Usuario>): Promise<Usuario> => {
  const { data } = await api.put<ApiResponse<Usuario>>('/usuarios/me', payload);
  return data.data!;
};
