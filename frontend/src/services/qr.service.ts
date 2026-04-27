import { api } from './api';
import { ApiResponse, PerfilPublico, TipoQR } from '../types';

export const obtenerPerfil = async (tipo: TipoQR, id: number): Promise<PerfilPublico> => {
  const { data } = await api.get<ApiResponse<PerfilPublico>>(`/qr/${tipo}/${id}/publico`);
  return data.data!;
};

export interface CoordsOpt {
  latitud?: number | null;
  longitud?: number | null;
}

export const registrarEscaneo = async (
  tipo: TipoQR,
  id: number,
  coords: CoordsOpt = {},
): Promise<{ escaneo_id: number; notificado: boolean }> => {
  const { data } = await api.post<ApiResponse<{ escaneo_id: number; notificado: boolean }>>(
    `/qr/${tipo}/${id}/escaneo`,
    {
      latitud:  coords.latitud  ?? null,
      longitud: coords.longitud ?? null,
    },
  );
  return data.data!;
};
