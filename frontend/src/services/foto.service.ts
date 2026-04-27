import { api } from './api';
import { ApiResponse } from '../types';

const upload = async (path: string, file: File): Promise<string> => {
  const fd = new FormData();
  fd.append('foto', file);
  const { data } = await api.post<ApiResponse<{ url: string }>>(path, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data!.url;
};

export const subirFotoUsuario   = (file: File)            => upload('/fotos/usuario/me', file);
export const subirFotoFamiliar  = (id: number, file: File) => upload(`/fotos/familiar/${id}`, file);
export const subirFotoMascota   = (id: number, file: File) => upload(`/fotos/mascota/${id}`,  file);
