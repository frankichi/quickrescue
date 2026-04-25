import { FormEvent, useEffect, useState } from 'react';
import * as svc from '../services/familiar.service';
import { Familiar } from '../types';
import { errorMessage } from '../services/api';

const VACIO = { nombre: '', telefono: '', email: '', relacion: '' };

export default function Familiares() {
  const [items, setItems] = useState<Familiar[]>([]);
  const [editando, setEditando] = useState<number | null>(null);
  const [form, setForm] = useState(VACIO);
  const [cargando, setCargando] = useState(true);
  const [err, setErr] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);

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

  const guardar = async (e: FormEvent) => {
    e.preventDefault();
    setErr('');
    try {
      if (editando) {
        await svc.actualizar(editando, form);
      } else {
        await svc.crear(form);
      }
      setForm(VACIO); setEditando(null); setMostrarForm(false);
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
    setForm(VACIO); setEditando(null); setMostrarForm(false);
  };

  return (
    <div>
      <div className="toolbar">
        <h1 className="page-title" style={{ margin: 0 }}>Familiares de contacto</h1>
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
              <label>Email (recibe alertas SOS)</label>
              <input type="email" value={form.email} onChange={set('email')} />
            </div>
          </div>
          {err && <p className="error-msg">{err}</p>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" className="primary">{editando ? 'Actualizar' : 'Crear'}</button>
            <button type="button" className="primary" style={{ background:'#6b7280' }} onClick={cancelar}>Cancelar</button>
          </div>
        </form>
      )}

      {cargando ? <div className="loader">Cargando…</div>
      : items.length === 0 ? <div className="empty">No tienes familiares registrados aún.</div>
      : (
        <table className="table">
          <thead><tr><th>Nombre</th><th>Relación</th><th>Teléfono</th><th>Email</th><th></th></tr></thead>
          <tbody>
            {items.map((f) => (
              <tr key={f.id}>
                <td>{f.nombre}</td><td>{f.relacion}</td>
                <td>{f.telefono}</td><td>{f.email || '—'}</td>
                <td className="row-actions">
                  <button onClick={() => editar(f)}>Editar</button>
                  <button onClick={() => eliminar(f.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
