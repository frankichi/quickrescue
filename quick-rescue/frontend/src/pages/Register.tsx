import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../services/api';

export default function Register() {
  const { registrar } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    nombre: '', apellido: '', email: '', password: '',
    dni: '', fecha_nacimiento: '',
  });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const set = (k: string) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(''); setCargando(true);
    try {
      // Limpiar campos opcionales vacíos antes de mandar
      const payload: Record<string, unknown> = { ...form };
      if (!payload.dni)              delete payload.dni;
      if (!payload.fecha_nacimiento) delete payload.fecha_nacimiento;
      await registrar(payload);
      nav('/');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Crear cuenta</h1>
        <p className="subtitle">Completa tus datos básicos</p>

        <div className="row-2">
          <div>
            <label>Nombre</label>
            <input value={form.nombre} onChange={set('nombre')} required />
          </div>
          <div>
            <label>Apellido</label>
            <input value={form.apellido} onChange={set('apellido')} required />
          </div>
        </div>

        <label>Correo electrónico</label>
        <input type="email" value={form.email} onChange={set('email')} required />

        <label>Contraseña (mín. 8 caracteres)</label>
        <input type="password" value={form.password} onChange={set('password')} required minLength={8} />

        <div className="row-2">
          <div>
            <label>DNI (opcional)</label>
            <input value={form.dni} onChange={set('dni')} />
          </div>
          <div>
            <label>Fecha nacimiento</label>
            <input type="date" value={form.fecha_nacimiento} onChange={set('fecha_nacimiento')} />
          </div>
        </div>

        {error && <p className="error-msg">{error}</p>}
        <button type="submit" className="primary" disabled={cargando}>
          {cargando ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>

        <p style={{ marginTop: 16, fontSize: 13, textAlign: 'center' }}>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </form>
    </div>
  );
}
