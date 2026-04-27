import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import * as svc from '../services/familiar.service';
import * as fotoSvc from '../services/foto.service';
import { Familiar } from '../types';
import { errorMessage } from '../services/api';
import QRModal from '../components/QRModal';

const VACIO = { nombre: '', telefono: '', email: '', relacion: '' };

export default function Familiares() {
  const [items, setItems] = useState<Familiar[]>([]);
  const [editando, setEditando] = useState<number | null>(null);
  const [form, setForm] = useState(VACIO);
  const [foto, setFoto] = useState<File | null>(null);
  const [cargando, setCargando] = useState(true);
  const [err, setErr] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [qrAbierto, setQrAbierto] = useState<Familiar | null>(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  const cargar = () => {
    setCargando(true);
    svc.listar()
      .then(setItems)
      .catch((e) => setErr(errorMessage(e)))
      .finally(() => setCargando(false));
  };

  useEffect(cargar, []);

  const set = (k: keyof typeof VACIO) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onFotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFoto(e.target.files?.[0] ?? null);
  };

  const guardar = async (e: FormEvent) => {
    e.preventDefault();
    setErr('');
    try {
      const guardado = editando
        ? await svc.actualizar(editando, form)
        : await svc.crear(form);
      // Si el usuario eligió una foto nueva, subirla después de tener el id.
      if (foto) {
        setSubiendoFoto(true);
        try {
          await fotoSvc.subirFotoFamiliar(guardado.id, foto);
        } catch (e) {
          setErr(`Familiar guardado pero la foto falló: ${errorMessage(e)}`);
        } finally {
          setSubiendoFoto(false);
        }
      }
      setForm(VACIO); setEditando(null); setMostrarForm(false); setFoto(null);
      cargar();
    } catch (e) {
      setErr(errorMessage(e));
    }
  };

  const editar = (f: Familiar) => {
    setForm({
      nombre: f.nombre, telefono: f.telefono,
      email: f.email || '', relacion: f.relacion,
    });
    setFoto(null);
    setEditando(f.id);
    setMostrarForm(true);
  };

  const eliminar = async (id: number) => {
    if (!confirm('¿Eliminar este familiar?')) return;
    try {
      await svc.eliminar(id);
      cargar();
    } catch (e) {
      setErr(errorMessage(e));
    }
  };

  const cancelar = () => {
    setForm(VACIO); setEditando(null); setMostrarForm(false); setFoto(null);
  };

  return (
    <div>
      <div className="toolbar">
        <h1 className="page-title" style={{ margin: 0 }}>Familiares</h1>
        {!mostrarForm && (
          <button className="btn-add" onClick={() => setMostrarForm(true)}>+ Agregar</button>
        )}
      </div>

      {mostrarForm && (
        <form className="form-card" onSubmit={guardar} style={{ marginBottom: 24 }}>
          <h3 style={{ marginTop: 0 }}>
            {editando ? 'Editar familiar' : 'Nuevo familiar'}
          </h3>
          <div className="row-2">
            <div>
              <label>Nombre completo</label>
              <input value={form.nombre} onChange={set('nombre')} required />
            </div>
            <div>
              <label>Relación (Hijo, Esposa, etc.)</label>
              <input value={form.relacion} onChange={set('relacion')} required />
            </div>
          </div>
          <div className="row-2">
            <div>
              <label>Teléfono</label>
              <input value={form.telefono} onChange={set('telefono')} required />
            </div>
            <div>
              <label>Email (recibe alertas)</label>
              <input type="email" value={form.email} onChange={set('email')} />
            </div>
          </div>
          <label>Foto (opcional, máx 5MB)</label>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onFotoChange} />
          {err && <p className="error-msg">{err}</p>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" className="primary" disabled={subiendoFoto}>
              {subiendoFoto ? 'Subiendo foto…' : (editando ? 'Actualizar' : 'Crear')}
            </button>
            <button type="button" className="primary" style={{ background:'#7F8C8D' }} onClick={cancelar}>Cancelar</button>
          </div>
        </form>
      )}

      {cargando ? <div className="loader">Cargando…</div>
      : items.length === 0 ? <div className="empty">No tienes familiares registrados aún.</div>
      : (
        <table className="table">
          <thead><tr><th></th><th>Nombre</th><th>Relación</th><th>Teléfono</th><th>Email</th><th></th></tr></thead>
          <tbody>
            {items.map((f) => (
              <tr key={f.id}>
                <td>
                  {f.foto
                    ? <img src={f.foto} alt={f.nombre} className="avatar-mini" />
                    : <div className="avatar-mini" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>}
                </td>
                <td>{f.nombre}</td><td>{f.relacion}</td>
                <td>{f.telefono}</td><td>{f.email || '—'}</td>
                <td className="row-actions">
                  <button onClick={() => setQrAbierto(f)}>🔲 Ver QR</button>
                  <button onClick={() => editar(f)}>Editar</button>
                  <button onClick={() => eliminar(f.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {qrAbierto && (
        <QRModal
          tipo="familiar"
          id={qrAbierto.id}
          nombre={qrAbierto.nombre}
          onClose={() => setQrAbierto(null)}
        />
      )}
    </div>
  );
}
