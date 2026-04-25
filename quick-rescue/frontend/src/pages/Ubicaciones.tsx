import { useEffect, useState } from 'react';
import * as svc from '../services/ubicacion.service';
import { Ubicacion } from '../types';
import { errorMessage } from '../services/api';

export default function Ubicaciones() {
  const [items, setItems] = useState<Ubicacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    svc.listar(100)
      .then(setItems)
      .catch((e) => setErr(errorMessage(e)))
      .finally(() => setCargando(false));
  }, []);

  const fmtFecha = (iso: string) => new Date(iso).toLocaleString('es-PE');
  const mapsUrl  = (lat: number, lng: number) =>
    `https://www.google.com/maps?q=${lat},${lng}`;

  return (
    <div>
      <h1 className="page-title">Mis ubicaciones</h1>
      {err && <p className="error-msg">{err}</p>}

      {/* TODO (Antigravity): añadir mapa con Leaflet o Google Maps mostrando los pines */}

      {cargando ? <div className="loader">Cargando…</div>
      : items.length === 0 ? <div className="empty">No hay ubicaciones reportadas todavía.</div>
      : (
        <table className="table">
          <thead><tr><th>Fecha</th><th>Coordenadas</th><th>Precisión</th><th>SOS</th><th></th></tr></thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.id}>
                <td>{fmtFecha(u.timestamp)}</td>
                <td>{u.latitud}, {u.longitud}</td>
                <td>{u.precision_m ? `${u.precision_m} m` : '—'}</td>
                <td>{u.es_sos ? <span className="badge">SOS</span> : '—'}</td>
                <td>
                  <a href={mapsUrl(u.latitud, u.longitud)} target="_blank" rel="noreferrer">
                    Ver mapa
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
