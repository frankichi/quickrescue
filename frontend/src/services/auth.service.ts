import { api } from './api';
import { AuthData, ApiResponse, Usuario } from '../types';

export const login = async (email: string, password: string): Promise<AuthData> => {
  const { data } = await api.post<ApiResponse<AuthData>>('/auth/login', { email, password });
  return data.data!;
};

export const registrar = async (payload: Record<string, unknown>): Promise<AuthData> => {
  const { data } = await api.post<ApiResponse<AuthData>>('/auth/register', payload);
  return data.data!;
};

export const me = async (): Promise<Usuario> => {
  const { data } = await api.get<ApiResponse<Usuario>>('/auth/me');
  return data.data!;
};
