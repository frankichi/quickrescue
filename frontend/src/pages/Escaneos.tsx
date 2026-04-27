import { useEffect, useState } from 'react';
import * as svc from '../services/escaneo.service';
import { Escaneo } from '../types';
import { errorMessage } from '../services/api';

const tipoLabel = (t: Escaneo['tipo']) =>
  t === 'mascota' ? '🐾 Mascota' : t === 'familiar' ? '👨‍👩‍👧 Familiar' : '👤 Titular';

const fechaLima = (iso: string) =>
  new Date(iso).toLocaleString('es-PE', { timeZone: 'America/Lima' });

const mapsLink = (lat: number, lon: number) =>
  `https://www.google.com/maps?q=${lat},${lon}`;

export default function Escaneos() {
  const [items, setItems] = useState<Escaneo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    svc.listar()
      .then(setItems)
      .catch((e) => setErr(errorMessage(e)))
      .finally(() => setCargando(false));
  }, []);

  return (
    <div>
      <h1 className="page-title">Historial de escaneos</h1>
      <p style={{ color: '#666', marginTop: -8 }}>
        Cada vez que alguien escanea un QR de los tuyos, queda registrado aquí.
      </p>

      {cargando ? <div className="loader">Cargando…</div>
      : err ? <div className="error-msg">{err}</div>
      : items.length === 0 ? <div className="empty">Aún no hay escaneos registrados.</div>
      : (
        <table className="table">
          <thead>
            <tr><th>Fecha</th><th>Tipo</th><th>Quién</th><th>Ubicación</th></tr>
          </thead>
          <tbody>
            {items.map((e) => (
              <tr key={e.id}>
                <td>{fechaLima(e.creado_en)}</td>
                <td>{tipoLabel(e.tipo)}</td>
                <td>{e.nombre_referencia}</td>
                <td>
                  {e.latitud != null && e.longitud != null
                    ? <a href={mapsLink(Number(e.latitud), Number(e.longitud))}
                         target="_blank" rel="noreferrer">📍 Ver mapa</a>
                    : <span style={{ color: '#888' }}>Sin ubicación</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
