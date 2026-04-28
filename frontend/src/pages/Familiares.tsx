import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import * as svc from '../services/familiar.service';
import * as fotoSvc from '../services/foto.service';
import { Familiar } from '../types';
import { errorMessage } from '../services/api';
import QRModal from '../components/QRModal';

interface FormState {
  nombre: string;
  apellido: string;
  dni: string;
  fecha_nacimiento: string;
  telefono: string;
  email: string;
  relacion: string;
  direccion: string;
  distrito: string;
  provincia: string;
  grupo_sanguineo: string;
  alergias: string;
  enfermedades: string;
  operaciones: string;
  medicamentos: string;
}

const VACIO: FormState = {
  nombre: '', apellido: '', dni: '', fecha_nacimiento: '',
  telefono: '', email: '', relacion: '',
  direccion: '', distrito: '', provincia: '',
  grupo_sanguineo: '',
  alergias: '', enfermedades: '', operaciones: '', medicamentos: '',
};

const GRUPOS_SANGUINEOS = ['', 'O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'] as const;

/** Convierte string vacío en null antes de mandar al backend. */
const nullifyEmpty = (s: string): string | null => {
  const t = s.trim();
  return t.length === 0 ? null : t;
};

export default function Familiares() {
  const [items, setItems] = useState<Familiar[]>([]);
  const [editando, setEditando] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(VACIO);
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

  const set = <K extends keyof FormState>(k: K) =>
    (e: { target: { value: string } }) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const onFotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFoto(e.target.files?.[0] ?? null);
  };

  const guardar = async (e: FormEvent) => {
    e.preventDefault();
    setErr('');
    const payload: svc.FamiliarInput = {
      nombre:           form.nombre.trim(),
      apellido:         nullifyEmpty(form.apellido),
      dni:              nullifyEmpty(form.dni),
      fecha_nacimiento: nullifyEmpty(form.fecha_nacimiento),
      telefono:         form.telefono.trim(),
      email:            nullifyEmpty(form.email),
      relacion:         form.relacion.trim(),
      direccion:        nullifyEmpty(form.direccion),
      distrito:         nullifyEmpty(form.distrito),
      provincia:        nullifyEmpty(form.provincia),
      grupo_sanguineo:  nullifyEmpty(form.grupo_sanguineo),
      alergias:         nullifyEmpty(form.alergias),
      enfermedades:     nullifyEmpty(form.enfermedades),
      operaciones:      nullifyEmpty(form.operaciones),
      medicamentos:     nullifyEmpty(form.medicamentos),
    };
    try {
      const guardado = editando
        ? await svc.actualizar(editando, payload)
        : await svc.crear(payload);
      // La foto se sube DESPUÉS para reusar el id del familiar.
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
      nombre:           f.nombre,
      apellido:         f.apellido         || '',
      dni:              f.dni              || '',
      fecha_nacimiento: f.fecha_nacimiento || '',
      telefono:         f.telefono,
      email:            f.email            || '',
      relacion:         f.relacion,
      direccion:        f.direccion        || '',
      distrito:         f.distrito         || '',
      provincia:        f.provincia        || '',
      grupo_sanguineo:  f.grupo_sanguineo  || '',
      alergias:         f.alergias         || '',
      enfermedades:     f.enfermedades     || '',
      operaciones:      f.operaciones      || '',
      medicamentos:     f.medicamentos     || '',
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

  const nombreCompleto = (f: Familiar) =>
    f.apellido ? `${f.nombre} ${f.apellido}` : f.nombre;

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

          {/* ----- Datos personales ----- */}
          <h4 className="form-section-title">Datos personales</h4>
          <div className="row-2">
            <div>
              <label>Nombre</label>
              <input value={form.nombre} onChange={set('nombre')} required />
            </div>
            <div>
              <label>Apellido</label>
              <input value={form.apellido} onChange={set('apellido')} />
            </div>
          </div>
          <div className="row-2">
            <div>
              <label>DNI</label>
              <input value={form.dni} onChange={set('dni')} />
            </div>
            <div>
              <label>Fecha de nacimiento</label>
              <input type="date" value={form.fecha_nacimiento} onChange={set('fecha_nacimiento')} />
            </div>
          </div>
          <label>Foto (opcional, máx 5MB)</label>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onFotoChange} />

          {/* ----- Contacto ----- */}
          <h4 className="form-section-title">Datos de contacto</h4>
          <div className="row-2">
            <div>
              <label>Teléfono</label>
              <input
                type="tel"
                inputMode="tel"
                placeholder="+51 987 654 321"
                pattern="[+0-9 \-()]{6,20}"
                value={form.telefono}
                onChange={set('telefono')}
                required
              />
            </div>
            <div>
              <label>Email (recibe alertas)</label>
              <input type="email" value={form.email} onChange={set('email')} />
            </div>
          </div>
          <label>Relación (Hijo, Esposa, etc.)</label>
          <input value={form.relacion} onChange={set('relacion')} required />

          {/* ----- Dirección ----- */}
          <h4 className="form-section-title">Dirección</h4>
          <label>Dirección</label>
          <input value={form.direccion} onChange={set('direccion')} />
          <div className="row-2">
            <div>
              <label>Distrito</label>
              <input value={form.distrito} onChange={set('distrito')} />
            </div>
            <div>
              <label>Provincia</label>
              <input value={form.provincia} onChange={set('provincia')} />
            </div>
          </div>

          {/* ----- Datos médicos ----- */}
          <h4 className="form-section-title">Datos médicos (se muestran al rescatista)</h4>
          <label>Grupo sanguíneo</label>
          <select value={form.grupo_sanguineo} onChange={set('grupo_sanguineo')}>
            {GRUPOS_SANGUINEOS.map((g) => (
              <option key={g} value={g}>{g === '' ? '— sin especificar —' : g}</option>
            ))}
          </select>
          <label>Alergias</label>
          <textarea rows={2} value={form.alergias} onChange={set('alergias')} placeholder="Ej. Penicilina, mariscos…" />
          <label>Enfermedades</label>
          <textarea rows={2} value={form.enfermedades} onChange={set('enfermedades')} placeholder="Ej. Diabetes II" />
          <label>Operaciones previas</label>
          <textarea rows={2} value={form.operaciones} onChange={set('operaciones')} />
          <label>Medicamentos</label>
          <textarea rows={2} value={form.medicamentos} onChange={set('medicamentos')} placeholder="Ej. Metformina 500mg" />

          {err && <p className="error-msg">{err}</p>}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
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
                    ? <img src={f.foto} alt={nombreCompleto(f)} className="avatar-mini" />
                    : <div className="avatar-mini" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>}
                </td>
                <td>{nombreCompleto(f)}</td><td>{f.relacion}</td>
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
          nombre={nombreCompleto(qrAbierto)}
          onClose={() => setQrAbierto(null)}
        />
      )}
    </div>
  );
}
