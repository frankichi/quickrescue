import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'nav-link active' : 'nav-link';

export default function Layout() {
  const { usuario, logout } = useAuth();
  const nav = useNavigate();

  const cerrarSesion = () => {
    logout();
    nav('/login');
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <Link to="/" className="brand">
          <span className="brand-dot" /> Quick Rescue
        </Link>
        <nav>
          <NavLink to="/"            end className={linkClass}>📊 Inicio</NavLink>
          <NavLink to="/perfil"          className={linkClass}>👤 Mi perfil</NavLink>
          <NavLink to="/familiares"      className={linkClass}>👨‍👩‍👧 Familiares</NavLink>
          <NavLink to="/mascotas"        className={linkClass}>🐾 Mascotas</NavLink>
          <NavLink to="/historial"       className={linkClass}>🩺 Historial médico</NavLink>
          <NavLink to="/ubicaciones"     className={linkClass}>📍 Ubicaciones</NavLink>
          <NavLink to="/escaneos"        className={linkClass}>🔔 Alertas</NavLink>
          <NavLink to="/tienda"          className={linkClass}>🛒 Tienda</NavLink>
        </nav>
        <div className="user-box">
          <div className="user-name">{usuario?.nombre} {usuario?.apellido}</div>
          <button className="btn-logout" onClick={cerrarSesion}>Cerrar sesión</button>
        </div>
      </aside>
      <main className="main"><Outlet /></main>
    </div>
  );
}
