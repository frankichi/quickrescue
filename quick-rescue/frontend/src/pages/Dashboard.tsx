import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as familiarSvc  from '../services/familiar.service';
import * as ubicacionSvc from '../services/ubicacion.service';

export default function Dashboard() {
  const { usuario } = useAuth();
  const [stats, setStats] = useState({ familiares: 0, ubicaciones: 0, sosTotal: 0 });

  useEffect(() => {
    Promise.all([familiarSvc.listar(), ubicacionSvc.listar(200)])
      .then(([fams, ubis]) => {
        setStats({
          familiares: fams.length,
          ubicaciones: ubis.length,
          sosTotal: ubis.filter((u) => u.es_sos).length,
        });
      })
      .catch(() => { /* dashboard tolera fallos */ });
  }, []);

  return (
    <div>
      <h1 className="page-title">Hola, {usuario?.nombre} 👋</h1>

      <div className="cards">
        <Link to="/familiares" className="card" style={{textDecoration:'none', color:'inherit'}}>
          <div className="label">Familiares</div>
          <div className="value">{stats.familiares}</div>
        </Link>
        <Link to="/ubicaciones" className="card" style={{textDecoration:'none', color:'inherit'}}>
          <div className="label">Ubicaciones reportadas</div>
          <div className="value">{stats.ubicaciones}</div>
        </Link>
        <div className="card">
          <div className="label">Alertas SOS</div>
          <div className="value">{stats.sosTotal}</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{marginTop:0}}>📱 Próximos pasos</h3>
        <ul style={{ lineHeight: 1.8, paddingLeft: 20 }}>
          <li><Link to="/perfil">Completa tu perfil</Link> con dirección y foto.</li>
          <li><Link to="/historial">Llena tu historial médico</Link> con alergias, medicamentos, etc.</li>
          <li><Link to="/familiares">Agrega 2-3 familiares</Link> que recibirán los emails de SOS.</li>
          <li>Descarga la <strong>app móvil</strong> para activar el botón SOS y reporte de ubicación.</li>
        </ul>
      </div>
    </div>
  );
}
