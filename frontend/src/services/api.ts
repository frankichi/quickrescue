import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

/**
 * Cliente Axios único. Inyecta automáticamente el JWT desde localStorage.
 * Si la respuesta es 401, limpia el token y redirige a /login.
 */
export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('qr_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (resp) => resp,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('qr_token');
      localStorage.removeItem('qr_usuario');
      // Solo redirigir si no estamos ya en login
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/** Helper para extraer el mensaje de error legible. */
export const errorMessage = (e: unknown): string => {
  if (axios.isAxiosError(e)) {
    return e.response?.data?.error || e.message;
  }
  return e instanceof Error ? e.message : 'Error desconocido';
};
