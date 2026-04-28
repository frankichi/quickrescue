import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import * as svc from '../services/usuario.service';
import * as fotoSvc from '../services/foto.service';
import { Usuario } from '../types';
import { errorMessage } from '../services/api';
import QRModal from '../components/QRModal';

export default function Profile() {
  const [form, setForm] = useState<Partial<Usuario>>({});
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [qrAbierto, setQrAbierto] = useState(false);

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

  const onFotoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMsg(''); setErr(''); setSubiendoFoto(true);
    try {
      const url = await fotoSvc.subirFotoUsuario(file);
      setForm((f) => ({ ...f, foto: url }));
      setMsg('Foto actualizada.');
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setSubiendoFoto(false);
    }
  };

  if (cargando) return <div className="loader">Cargando…</div>;

  return (
    <div>
      <div className="toolbar">
        <h1 className="page-title" style={{ margin: 0 }}>Mi perfil</h1>
        {form.id && (
          <button className="btn-add" onClick={() => setQrAbierto(true)}>🔲 Mi código QR</button>
        )}
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
          <div>
            {form.foto
              ? <img src={form.foto} alt="Mi foto" style={{
                  width: 96, height: 96, borderRadius: '50%', objectFit: 'cover',
                  border: '3px solid #5BA0D0',
                }} />
              : <div style={{
                  width: 96, height: 96, borderRadius: '50%', background: '#F8F9FA',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 40, border: '3px solid #E3E9EF',
                }}>👤</div>}
          </div>
          <div style={{ flex: 1 }}>
            <label>Mi foto</label>
            <input type="file" accept="image/jpeg,image/png,image/webp"
                   onChange={onFotoChange} disabled={subiendoFoto} />
            {subiendoFoto && <p style={{ color: '#5BA0D0', fontSize: 13 }}>Subiendo…</p>}
          </div>
        </div>

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

        <label>Teléfono (lo verá el rescatista al escanear el QR)</label>
        <input
          type="tel"
          inputMode="tel"
          placeholder="+51 987 654 321"
          pattern="[+0-9 \-()]{6,20}"
          value={form.telefono || ''}
          onChange={set('telefono')}
        />

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

        {msg && <p className="success-msg">{msg}</p>}
        {err && <p className="error-msg">{err}</p>}
        <button type="submit" className="primary" disabled={guardando}>
          {guardando ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </form>

      {qrAbierto && form.id && (
        <QRModal
          tipo="usuario"
          id={form.id}
          nombre={`${form.nombre ?? ''} ${form.apellido ?? ''}`.trim()}
          onClose={() => setQrAbierto(false)}
        />
      )}
    </div>
  );
}
