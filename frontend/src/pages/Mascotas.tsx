import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import * as svc from '../services/mascota.service';
import * as fotoSvc from '../services/foto.service';
import { Mascota, EspecieMascota } from '../types';
import { errorMessage } from '../services/api';
import QRModal from '../components/QRModal';

interface FormState {
  nombre: string;
  especie: EspecieMascota;
  raza: string;
  color: string;
  edad_anios: string;
  perdida: boolean;
  mensaje_perdida: string;
  alergias: string;
  medicamentos: string;
  condiciones: string;
}

const VACIO: FormState = {
  nombre: '', especie: 'perro', raza: '', color: '',
  edad_anios: '',
  perdida: false, mensaje_perdida: '',
  alergias: '', medicamentos: '', condiciones: '',
};

/** String vacío → null, para no mandar "" al backend. */
const nullifyEmpty = (s: string): string | null => {
  const t = s.trim();
  return t.length === 0 ? null : t;
};

export default function Mascotas() {
  const [items, setItems] = useState<Mascota[]>([]);
  const [editando, setEditando] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(VACIO);
  const [cargando, setCargando] = useState(true);
  const [err, setErr] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [qrAbierto, setQrAbierto] = useState<Mascota | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  const onFotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFotoFile(e.target.files?.[0] ?? null);
  };

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
    const payload: svc.MascotaInput = {
      nombre:          form.nombre.trim(),
      especie:         form.especie,
      raza:            nullifyEmpty(form.raza),
      color:           nullifyEmpty(form.color),
      edad_anios:      form.edad_anios === '' ? null : Number(form.edad_anios),
      perdida:         form.perdida,
      mensaje_perdida: nullifyEmpty(form.mensaje_perdida),
      alergias:        nullifyEmpty(form.alergias),
      medicamentos:    nullifyEmpty(form.medicamentos),
      condiciones:     nullifyEmpty(form.condiciones),
    };
    try {
      const guardada = editando
        ? await svc.actualizar(editando, payload)
        : await svc.crear(payload);
      if (fotoFile) {
        setSubiendoFoto(true);
        try {
          await fotoSvc.subirFotoMascota(guardada.id, fotoFile);
        } catch (e) {
          setErr(`Mascota guardada pero la foto falló: ${errorMessage(e)}`);
        } finally {
          setSubiendoFoto(false);
        }
      }
      setForm(VACIO); setEditando(null); setMostrarForm(false); setFotoFile(null);
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
      perdida: m.perdida,
      mensaje_perdida: m.mensaje_perdida || '',
      alergias:        m.alergias        || '',
      medicamentos:    m.medicamentos    || '',
      condiciones:     m.condiciones     || '',
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
          <div>
            <label>Edad (años)</label>
            <input type="number" min="0" max="60" value={form.edad_anios} onChange={set('edad_anios')} />
          </div>
          <label>Foto (opcional, máx 5MB)</label>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onFotoChange} />

          <h4 className="form-section-title">Datos médicos (opcionales, los verá el rescatista)</h4>
          <label>Alergias</label>
          <textarea rows={2} value={form.alergias} onChange={set('alergias')} placeholder="Ej. Picaduras de pulga, ciertos antibióticos…" />
          <label>Medicamentos</label>
          <textarea rows={2} value={form.medicamentos} onChange={set('medicamentos')} placeholder="Ej. Apoquel diario" />
          <label>Condiciones</label>
          <textarea rows={2} value={form.condiciones} onChange={set('condiciones')} placeholder="Ej. Es ciego del ojo izquierdo, miedo a ruidos fuertes" />

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
            <button type="submit" className="primary" disabled={subiendoFoto}>
              {subiendoFoto ? 'Subiendo foto…' : (editando ? 'Actualizar' : 'Crear')}
            </button>
            <button type="button" className="primary" style={{ background:'#7F8C8D' }} onClick={cancelar}>Cancelar</button>
          </div>
        </form>
      )}

      {cargando ? <div className="loader">Cargando…</div>
      : items.length === 0 ? <div className="empty">No tienes mascotas registradas aún.</div>
      : (
        <table className="table">
          <thead>
            <tr>
              <th></th><th>Nombre</th><th>Especie</th><th>Raza</th><th>Edad</th><th>Estado</th><th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((m) => (
              <tr key={m.id}>
                <td>
                  {m.foto
                    ? <img src={m.foto} alt={m.nombre} className="avatar-mini" />
                    : <div className="avatar-mini" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🐾</div>}
                </td>
                <td>{m.nombre}</td>
                <td style={{ textTransform: 'capitalize' }}>{m.especie}</td>
                <td>{m.raza || '—'}</td>
                <td>{m.edad_anios != null ? `${m.edad_anios} año${m.edad_anios === 1 ? '' : 's'}` : '—'}</td>
                <td>
                  {m.perdida
                    ? <span className="badge danger">🚨 Perdida</span>
                    : <span className="badge success">En casa</span>}
                </td>
                <td className="row-actions">
                  <button onClick={() => setQrAbierto(m)}>🔲 Ver QR</button>
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
