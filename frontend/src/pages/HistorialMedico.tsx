import { FormEvent, useEffect, useState } from 'react';
import * as svc from '../services/historial.service';
import { HistorialMedico } from '../types';
import { errorMessage } from '../services/api';

export default function HistorialMedicoPage() {
  const [form, setForm] = useState<Partial<HistorialMedico>>({});
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    svc.obtener()
      .then(setForm)
      .catch((e) => setErr(errorMessage(e)))
      .finally(() => setCargando(false));
  }, []);

  const set = (k: keyof HistorialMedico) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const guardar = async (e: FormEvent) => {
    e.preventDefault();
    setMsg(''); setErr(''); setGuardando(true);
    try {
      const h = await svc.actualizar(form);
      setForm(h);
      setMsg('Historial actualizado.');
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <div className="loader">Cargando…</div>;

  return (
    <div>
      <h1 className="page-title">Historial médico</h1>
      <p style={{ color: 'var(--muted)', marginTop: -16, marginBottom: 24 }}>
        Esta información estará disponible para los rescatistas en caso de emergencia.
      </p>

      <form className="form-card" onSubmit={guardar}>
        <label>Grupo sanguíneo</label>
        <select value={form.grupo_sanguineo || ''} onChange={set('grupo_sanguineo')}>
          <option value="">— Seleccionar —</option>
          {['O+','O-','A+','A-','B+','B-','AB+','AB-'].map(g => <option key={g}>{g}</option>)}
        </select>

        <label>Alergias</label>
        <textarea rows={2} value={form.alergias || ''} onChange={set('alergias')}
                  placeholder="Penicilina, mariscos…" />

        <label>Enfermedades / condiciones</label>
        <textarea rows={2} value={form.enfermedades || ''} onChange={set('enfermedades')}
                  placeholder="Diabetes tipo II, hipertensión…" />

        <label>Operaciones / cirugías</label>
        <textarea rows={2} value={form.operaciones || ''} onChange={set('operaciones')} />

        <label>Medicamentos actuales</label>
        <textarea rows={2} value={form.medicamentos || ''} onChange={set('medicamentos')}
                  placeholder="Losartán 50mg c/12h…" />

        {msg && <p className="success-msg">{msg}</p>}
        {err && <p className="error-msg">{err}</p>}
        <button type="submit" className="primary" disabled={guardando}>
          {guardando ? 'Guardando…' : 'Guardar'}
        </button>
      </form>
    </div>
  );
}
