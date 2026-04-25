import { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Envuelve rutas que requieren sesión. Si no hay usuario,
 * redirige a /login. Mientras hidrata desde localStorage muestra loader.
 */
export default function ProtectedRoute({ children }: { children: ReactElement }) {
  const { usuario, cargando } = useAuth();
  if (cargando) return <div className="loader">Cargando…</div>;
  if (!usuario) return <Navigate to="/login" replace />;
  return children;
}
