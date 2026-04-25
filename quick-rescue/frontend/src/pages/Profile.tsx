import { FormEvent, useEffect, useState } from 'react';
import * as svc from '../services/usuario.service';
import { Usuario } from '../types';
import { errorMessage } from '../services/api';

export default function Profile() {
  const [form, setForm] = useState<Partial<Usuario>>({});
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    svc.obtenerMiPerfil()
      .then((u) => setForm(u))
      .catch((e) => setErr(errorMessage(e)))
      .finally(() => setCargando(false));
  }, []);

  const set = (k: keyof Usuario) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMsg(''); setErr(''); setGuardando(true);
    try {
      const u = await svc.actualizarMiPerfil(form);
      setForm(u);
      setMsg('Perfil actualizado correctamente.');
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <div className="loader">Cargando…</div>;

  return (
    <div>
      <h1 className="page-title">Mi perfil</h1>
      <form className="form-card" onSubmit={handleSubmit}>
        <div className="row-2">
          <div>
            <label>Nombre</label>
            <input value={form.nombre || ''} onChange={set('nombre')} required />
          </div>
          <div>
            <label>Apellido</label>
            <input value={form.apellido || ''} onChange={set('apellido')} required />
          </div>
        </div>

        <div className="row-2">
          <div>
            <label>DNI</label>
            <input value={form.dni || ''} onChange={set('dni')} />
          </div>
          <div>
            <label>Fecha nacimiento</label>
            <input type="date" value={form.fecha_nacimiento || ''} onChange={set('fecha_nacimiento')} />
          </div>
        </div>

        <label>Dirección</label>
        <input value={form.direccion || ''} onChange={set('direccion')} />

        <div className="row-2">
          <div>
            <label>Distrito</label>
            <input value={form.distrito || ''} onChange={set('distrito')} />
          </div>
          <div>
            <label>Provincia</label>
            <input value={form.provincia || ''} onChange={set('provincia')} />
          </div>
        </div>

        <label>URL de foto (opcional)</label>
        <input value={form.foto || ''} onChange={set('foto')} placeholder="https://..." />

        {msg && <p className="success-msg">{msg}</p>}
        {err && <p className="error-msg">{err}</p>}
        <button type="submit" className="primary" disabled={guardando}>
          {guardando ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  );
}
