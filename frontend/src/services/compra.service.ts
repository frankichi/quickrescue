import { api } from './api';
import { ApiResponse, Compra, Producto, ProductoQR, DestinatarioTipo } from '../types';

export const listarProductos = async (): Promise<Producto[]> => {
  const { data } = await api.get<ApiResponse<Producto[]>>('/tienda/productos');
  return data.data!;
};

export interface CompraInput {
  producto: ProductoQR;
  destinatario_tipo: DestinatarioTipo;
  destinatario_id: number;
  notas?: string;
}

export const crearCompra = async (payload: CompraInput): Promise<Compra> => {
  const { data } = await api.post<ApiResponse<Compra>>('/compras', payload);
  return data.data!;
};

export const listarCompras = async (): Promise<Compra[]> => {
  const { data } = await api.get<ApiResponse<Compra[]>>('/compras');
  return data.data!;
};
