import { api } from './api';
import { ApiResponse, Escaneo } from '../types';

export const listar = async (limit = 100): Promise<Escaneo[]> => {
  const { data } = await api.get<ApiResponse<Escaneo[]>>(`/escaneos?limit=${limit}`);
  return data.data!;
};
