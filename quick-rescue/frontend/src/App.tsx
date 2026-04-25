import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Familiares from './pages/Familiares';
import HistorialMedico from './pages/HistorialMedico';
import Ubicaciones from './pages/Ubicaciones';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

export default function App() {
  return (
    <Routes>
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/"          element={<Dashboard />} />
        <Route path="/perfil"    element={<Profile />} />
        <Route path="/familiares" element={<Familiares />} />
        <Route path="/historial" element={<HistorialMedico />} />
        <Route path="/ubicaciones" element={<Ubicaciones />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
