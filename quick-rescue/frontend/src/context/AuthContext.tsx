import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Usuario, AuthData } from '../types';
import * as authService from '../services/auth.service';

interface AuthContextValue {
  usuario: Usuario | null;
  cargando: boolean;
  login: (email: string, password: string) => Promise<void>;
  registrar: (payload: Record<string, unknown>) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  // Hidratar sesión desde localStorage al montar
  useEffect(() => {
    const stored = localStorage.getItem('qr_usuario');
    if (stored) {
      try { setUsuario(JSON.parse(stored)); } catch { /* invalid JSON */ }
    }
    setCargando(false);
  }, []);

  const persistir = (data: AuthData) => {
    localStorage.setItem('qr_token', data.token);
    localStorage.setItem('qr_usuario', JSON.stringify(data.usuario));
    setUsuario(data.usuario);
  };

  const login = async (email: string, password: string) => {
    const data = await authService.login(email, password);
    persistir(data);
  };

  const registrar = async (payload: Record<string, unknown>) => {
    const data = await authService.registrar(payload);
    persistir(data);
  };

  const logout = () => {
    localStorage.removeItem('qr_token');
    localStorage.removeItem('qr_usuario');
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, registrar, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
};
