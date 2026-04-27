import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Familiares from './pages/Familiares';
import Mascotas from './pages/Mascotas';
import HistorialMedico from './pages/HistorialMedico';
import Ubicaciones from './pages/Ubicaciones';
import Escaneos from './pages/Escaneos';
import Tienda from './pages/Tienda';
import PublicQR from './pages/PublicQR';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

export default function App() {
  return (
    <Routes>
      {/* Públicas (sin auth) */}
      <Route path="/login"        element={<Login />} />
      <Route path="/register"     element={<Register />} />
      <Route path="/qr/:tipo/:id" element={<PublicQR />} />

      {/* Privadas (con sidebar) */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/"            element={<Dashboard />} />
        <Route path="/perfil"      element={<Profile />} />
        <Route path="/familiares"  element={<Familiares />} />
        <Route path="/mascotas"    element={<Mascotas />} />
        <Route path="/historial"   element={<HistorialMedico />} />
        <Route path="/ubicaciones" element={<Ubicaciones />} />
        <Route path="/escaneos"    element={<Escaneos />} />
        <Route path="/tienda"      element={<Tienda />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
