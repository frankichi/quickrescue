import { api } from './api';
import { HistorialMedico, ApiResponse } from '../types';

export const obtener = async (): Promise<HistorialMedico> => {
  const { data } = await api.get<ApiResponse<HistorialMedico>>('/historial-medico');
  return data.data!;
};

export const actualizar = async (payload: Partial<HistorialMedico>): Promise<HistorialMedico> => {
  const { data } = await api.put<ApiResponse<HistorialMedico>>('/historial-medico', payload);
  return data.data!;
};
