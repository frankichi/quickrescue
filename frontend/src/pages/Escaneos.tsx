import { useEffect, useMemo, useState } from 'react';
import * as svc from '../services/escaneo.service';
import { Escaneo, TipoQR } from '../types';
import { errorMessage } from '../services/api';

const TIPO_LABEL: Record<TipoQR, string> = {
  usuario:  '👤 Titular',
  familiar: '👨‍👩‍👧 Familiar',
  mascota:  '🐾 Mascota',
};

const fechaLima = (iso: string) =>
  new Date(iso).toLocaleString('es-PE', { timeZone: 'America/Lima' });

const mapsLink = (lat: number, lon: number) =>
  `https://www.google.com/maps?q=${lat},${lon}`;

type Filtro = 'todos' | TipoQR;

export default function Escaneos() {
  const [items, setItems] = useState<Escaneo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [err, setErr] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('todos');

  useEffect(() => {
    svc.listar()
      .then(setItems)
      .catch((e) => setErr(errorMessage(e)))
      .finally(() => setCargando(false));
  }, []);

  const filtrados = useMemo(
    () => filtro === 'todos' ? items : items.filter((e) => e.tipo === filtro),
    [items, filtro],
  );

  return (
    <div>
      <h1 className="page-title">🔔 Alertas</h1>
      <p style={{ color: '#7F8C8D', marginTop: -8 }}>
        Cada vez que alguien escanea uno de tus QR físicos, queda registrado aquí.
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['todos', 'usuario', 'familiar', 'mascota'] as Filtro[]).map((t) => (
          <button
            key={t}
            onClick={() => setFiltro(t)}
            className="primary"
            style={{
              width: 'auto', padding: '6px 14px',
              background: filtro === t ? '#5BA0D0' : '#FFFFFF',
              color: filtro === t ? '#FFFFFF' : '#2C3E50',
              border: '1px solid #E3E9EF', marginTop: 0,
            }}
          >
            {t === 'todos' ? 'Todos' : TIPO_LABEL[t]}
          </button>
        ))}
      </div>

      {cargando ? <div className="loader">Cargando…</div>
      : err ? <div className="error-msg">{err}</div>
      : filtrados.length === 0 ? <div className="empty">Aún no tienes escaneos.</div>
      : (
        <table className="table">
          <thead>
            <tr><th>Fecha</th><th>Tipo</th><th>Quién</th><th>Ubicación</th></tr>
          </thead>
          <tbody>
            {filtrados.map((e) => (
              <tr key={e.id}>
                <td>{fechaLima(e.creado_en)}</td>
                <td>{TIPO_LABEL[e.tipo]}</td>
                <td>{e.nombre_referencia}</td>
                <td>
                  {e.latitud != null && e.longitud != null
                    ? <a href={mapsLink(Number(e.latitud), Number(e.longitud))}
                         target="_blank" rel="noreferrer">
                        📍 {e.direccion ?? 'Ver mapa'}
                      </a>
                    : <span style={{ color: '#7F8C8D' }}>Sin ubicación</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
