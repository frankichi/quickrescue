import { api } from './api';
import { Ubicacion, ApiResponse } from '../types';

export const listar = async (limit = 50): Promise<Ubicacion[]> => {
  const { data } = await api.get<ApiResponse<Ubicacion[]>>(`/ubicaciones?limit=${limit}`);
  return data.data!;
};
