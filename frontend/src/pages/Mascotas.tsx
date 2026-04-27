import { FormEvent, useEffect, useState } from 'react';
import * as svc from '../services/mascota.service';
import { Mascota, EspecieMascota } from '../types';
import { errorMessage } from '../services/api';
import QRModal from '../components/QRModal';

interface FormState {
  nombre: string;
  especie: EspecieMascota;
  raza: string;
  color: string;
  edad_anios: string;
  foto: string;
  microchip: string;
  perdida: boolean;
  mensaje_perdida: string;
}

const VACIO: FormState = {
  nombre: '', especie: 'perro', raza: '', color: '',
  edad_anios: '', foto: '', microchip: '',
  perdida: false, mensaje_perdida: '',
};

export default function Mascotas() {
  const [items, setItems] = useState<Mascota[]>([]);
  const [editando, setEditando] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(VACIO);
  const [cargando, setCargando] = useState(true);
  const [err, setErr] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [qrAbierto, setQrAbierto] = useState<Mascota | null>(null);

  const cargar = () => {
    setCargando(true);
    svc.listar()
      .then(setItems)
      .catch((e) => setErr(errorMessage(e)))
      .finally(() => setCargando(false));
  };

  useEffect(cargar, []);

  const set = <K extends keyof FormState>(k: K) =>
    (e: { target: { value: string; checked?: boolean; type?: string } }) =>
      setForm((f) => ({
        ...f,
        [k]: e.target.type === 'checkbox' ? !!e.target.checked : e.target.value,
      }));

  const guardar = async (e: FormEvent) => {
    e.preventDefault();
    setErr('');
    const payload = {
      nombre:          form.nombre,
      especie:         form.especie,
      raza:            form.raza || null,
      color:           form.color || null,
      edad_anios:      form.edad_anios === '' ? null : Number(form.edad_anios),
      foto:            form.foto || null,
      microchip:       form.microchip || null,
      perdida:         form.perdida,
      mensaje_perdida: form.mensaje_perdida || null,
    };
    try {
      if (editando) {
        await svc.actualizar(editando, payload);
      } else {
        await svc.crear(payload);
      }
      setForm(VACIO); setEditando(null); setMostrarForm(false);
      cargar();
    } catch (e) {
      setErr(errorMessage(e));
    }
  };

  const editar = (m: Mascota) => {
    setForm({
      nombre: m.nombre,
      especie: m.especie,
      raza: m.raza || '',
      color: m.color || '',
      edad_anios: m.edad_anios?.toString() || '',
      foto: m.foto || '',
      microchip: m.microchip || '',
      perdida: m.perdida,
      mensaje_perdida: m.mensaje_perdida || '',
    });
    setEditando(m.id);
    setMostrarForm(true);
  };

  const eliminar = async (id: number) => {
    if (!confirm('¿Eliminar esta mascota?')) return;
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
        <h1 className="page-title" style={{ margin: 0 }}>Mis mascotas</h1>
        {!mostrarForm && (
          <button className="btn-add" onClick={() => setMostrarForm(true)}>+ Agregar</button>
        )}
      </div>

      {mostrarForm && (
        <form className="form-card" onSubmit={guardar} style={{ marginBottom: 24 }}>
          <h3 style={{ marginTop: 0 }}>
            {editando ? 'Editar mascota' : 'Nueva mascota'}
          </h3>
          <div className="row-2">
            <div>
              <label>Nombre</label>
              <input value={form.nombre} onChange={set('nombre')} required />
            </div>
            <div>
              <label>Especie</label>
              <select
                value={form.especie}
                onChange={(e) => setForm((f) => ({ ...f, especie: e.target.value as EspecieMascota }))}
                required
              >
                <option value="perro">Perro</option>
                <option value="gato">Gato</option>
                <option value="otro">Otro</option>
              </select>
            </div>
          </div>
          <div className="row-2">
            <div>
              <label>Raza</label>
              <input value={form.raza} onChange={set('raza')} />
            </div>
            <div>
              <label>Color</label>
              <input value={form.color} onChange={set('color')} />
            </div>
          </div>
          <div className="row-2">
            <div>
              <label>Edad (años)</label>
              <input type="number" min="0" max="60" value={form.edad_anios} onChange={set('edad_anios')} />
            </div>
            <div>
              <label>Microchip</label>
              <input value={form.microchip} onChange={set('microchip')} />
            </div>
          </div>
          <div>
            <label>Foto (URL)</label>
            <input value={form.foto} onChange={set('foto')} />
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={form.perdida}
                onChange={(e) => setForm((f) => ({ ...f, perdida: e.target.checked }))}
              />
              Marcar como perdida
            </label>
          </div>
          {form.perdida && (
            <div>
              <label>Mensaje para quien la encuentre</label>
              <textarea
                rows={3}
                value={form.mensaje_perdida}
                onChange={set('mensaje_perdida')}
              />
            </div>
          )}
          {err && <p className="error-msg">{err}</p>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" className="primary">{editando ? 'Actualizar' : 'Crear'}</button>
            <button type="button" className="primary" style={{ background:'#6b7280' }} onClick={cancelar}>Cancelar</button>
          </div>
        </form>
      )}

      {cargando ? <div className="loader">Cargando…</div>
      : items.length === 0 ? <div className="empty">No tienes mascotas registradas aún.</div>
      : (
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th><th>Especie</th><th>Raza</th><th>Edad</th><th>Estado</th><th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((m) => (
              <tr key={m.id}>
                <td>{m.nombre}</td>
                <td style={{ textTransform: 'capitalize' }}>{m.especie}</td>
                <td>{m.raza || '—'}</td>
                <td>{m.edad_anios != null ? `${m.edad_anios} año${m.edad_anios === 1 ? '' : 's'}` : '—'}</td>
                <td>
                  {m.perdida
                    ? <span style={{ color: '#dc2626', fontWeight: 600 }}>🚨 Perdida</span>
                    : <span style={{ color: '#16a34a' }}>En casa</span>}
                </td>
                <td className="row-actions">
                  <button onClick={() => setQrAbierto(m)}>Ver QR</button>
                  <button onClick={() => editar(m)}>Editar</button>
                  <button onClick={() => eliminar(m.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {qrAbierto && (
        <QRModal
          tipo="mascota"
          id={qrAbierto.id}
          nombre={qrAbierto.nombre}
          onClose={() => setQrAbierto(null)}
        />
      )}
    </div>
  );
}
