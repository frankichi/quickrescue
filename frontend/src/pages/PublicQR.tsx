import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as qrSvc from '../services/qr.service';
import { PerfilPublico, TipoQR } from '../types';
import { errorMessage } from '../services/api';

const TIPOS_VALIDOS: TipoQR[] = ['usuario', 'familiar', 'mascota'];

export default function PublicQR() {
  const { tipo, id } = useParams<{ tipo: string; id: string }>();
  const [perfil, setPerfil] = useState<PerfilPublico | null>(null);
  const [cargando, setCargando] = useState(true);
  const [err, setErr] = useState<string>('');
  const [notificando, setNotificando] = useState(false);
  const [notificado, setNotificado] = useState(false);
  const [notifErr, setNotifErr] = useState('');

  const tipoValido = (TIPOS_VALIDOS as string[]).includes(tipo ?? '');
  const idNum = parseInt(id ?? '', 10);

  useEffect(() => {
    if (!tipoValido || !Number.isInteger(idNum) || idNum < 1) {
      setCargando(false);
      setErr('QR no válido');
      return;
    }
    qrSvc.obtenerPerfil(tipo as TipoQR, idNum)
      .then(setPerfil)
      .catch((e) => setErr(errorMessage(e)))
      .finally(() => setCargando(false));
  }, [tipo, id]);

  const notificarUbicacion = () => {
    if (!perfil) return;
    setNotifErr(''); setNotificando(true);

    const enviar = (coords?: { latitud: number; longitud: number }) => {
      qrSvc.registrarEscaneo(perfil.tipo, perfil.id, coords ?? {})
        .then(() => setNotificado(true))
        .catch((e) => setNotifErr(errorMessage(e)))
        .finally(() => setNotificando(false));
    };

    if (!('geolocation' in navigator)) {
      enviar();
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => enviar({ latitud: pos.coords.latitude, longitud: pos.coords.longitude }),
      // Si el usuario niega permiso, registramos igual sin coords
      () => enviar(),
      { timeout: 10_000, enableHighAccuracy: false },
    );
  };

  if (cargando) {
    return <Layout><div className="pq-center"><div className="pq-spinner" /></div></Layout>;
  }
  if (err || !perfil) {
    return (
      <Layout>
        <div className="pq-card">
          <h2 style={{ margin: 0, color: '#d62828' }}>QR no válido</h2>
          <p style={{ color: '#555' }}>{err || 'No pudimos encontrar este perfil.'}</p>
        </div>
      </Layout>
    );
  }

  const tel = perfil.contacto.telefono;
  return (
    <Layout>
      <div className="pq-card">
        <div className="pq-foto-wrap">
          {perfil.foto
            ? <img src={perfil.foto} alt={perfil.nombre} className="pq-foto" />
            : <div className="pq-foto pq-foto-placeholder">👤</div>}
        </div>
        <h1 className="pq-nombre">{perfil.nombre}</h1>
        <p className="pq-subtitulo">{perfil.subtitulo}</p>

        {perfil.perdida && (
          <div className="pq-alerta-perdida">
            🚨 Esta mascota está reportada como <strong>PERDIDA</strong>.
            {perfil.mensaje_perdida && <p>{perfil.mensaje_perdida}</p>}
          </div>
        )}

        {(perfil.grupo_sanguineo || perfil.alergias || perfil.enfermedades || perfil.medicamentos) && (
          <section className="pq-section">
            <h3>Información médica</h3>
            <Dato label="Grupo sanguíneo" valor={perfil.grupo_sanguineo} destacar />
            <Dato label="Alergias"        valor={perfil.alergias} />
            <Dato label="Enfermedades"    valor={perfil.enfermedades} />
            <Dato label="Medicamentos"    valor={perfil.medicamentos} />
          </section>
        )}

        {perfil.microchip && (
          <section className="pq-section">
            <h3>Microchip</h3>
            <p style={{ fontFamily: 'monospace', fontSize: 16 }}>{perfil.microchip}</p>
          </section>
        )}

        <section className="pq-section">
          <h3>Contacto del titular</h3>
          <p style={{ marginBottom: 16 }}>
            <strong>{perfil.contacto.nombre_titular}</strong>
            {perfil.contacto.relacion && <> ({perfil.contacto.relacion})</>}
          </p>
          {tel
            ? <a href={`tel:${tel}`} className="pq-btn-llamar">📞 Llamar al titular</a>
            : <p style={{ color: '#888' }}>El titular no tiene teléfono de contacto cargado.</p>}

          {perfil.contacto.familiares.length > 1 && (
            <div className="pq-otros-contactos">
              <h4>Otros contactos</h4>
              {perfil.contacto.familiares.slice(1).map((f, i) => (
                <a key={i} href={`tel:${f.telefono}`} className="pq-contacto-extra">
                  {f.nombre} ({f.relacion}) — {f.telefono}
                </a>
              ))}
            </div>
          )}
        </section>

        <section className="pq-section">
          {notificado
            ? <div className="pq-notificado">✓ Notificamos al titular</div>
            : <>
                <button
                  className="pq-btn-notificar"
                  onClick={notificarUbicacion}
                  disabled={notificando}
                >
                  {notificando ? 'Enviando…' : `Notificar dónde encontré a ${perfil.nombre}`}
                </button>
                {notifErr && <p className="pq-error">{notifErr}</p>}
                <p className="pq-notif-help">
                  Solicitaremos tu ubicación. Si la niegas, igual avisamos al titular.
                </p>
              </>}
        </section>
      </div>
    </Layout>
  );
}

function Dato({ label, valor, destacar = false }: { label: string; valor?: string | null; destacar?: boolean }) {
  if (!valor) return null;
  return (
    <div className={`pq-dato ${destacar ? 'pq-dato-destacar' : ''}`}>
      <span className="pq-dato-label">{label}</span>
      <span className="pq-dato-valor">{valor}</span>
    </div>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pq-page">
      <header className="pq-header">
        <span className="pq-logo-dot" /> Quick Rescue
      </header>
      <main className="pq-main">{children}</main>
      <footer className="pq-footer">
        Si necesitas ayuda urgente, llama al <strong>116</strong> (SAMU Perú).
      </footer>
      <PublicStyles />
    </div>
  );
}

function PublicStyles() {
  return (
    <style>{`
      .pq-page { min-height: 100vh; background: #f7f7f8; display: flex; flex-direction: column; }
      .pq-header { background: #d62828; color: white; padding: 14px 20px; font-weight: 700; font-size: 18px; display: flex; align-items: center; gap: 10px; }
      .pq-logo-dot { width: 14px; height: 14px; background: white; border-radius: 50%; display: inline-block; }
      .pq-main { flex: 1; padding: 16px; display: flex; justify-content: center; }
      .pq-card { background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,.06); padding: 24px; max-width: 520px; width: 100%; }
      .pq-foto-wrap { display: flex; justify-content: center; margin-bottom: 12px; }
      .pq-foto { width: 140px; height: 140px; border-radius: 50%; object-fit: cover; border: 4px solid #d62828; }
      .pq-foto-placeholder { background: #eee; display: flex; align-items: center; justify-content: center; font-size: 64px; color: #aaa; }
      .pq-nombre { text-align: center; font-size: 28px; margin: 8px 0 2px; color: #1a1a1a; }
      .pq-subtitulo { text-align: center; color: #666; margin: 0 0 16px; font-size: 16px; }
      .pq-alerta-perdida { background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 12px; margin: 12px 0; color: #6b4c00; }
      .pq-section { border-top: 1px solid #eee; padding-top: 16px; margin-top: 16px; }
      .pq-section h3 { margin: 0 0 12px; font-size: 17px; color: #d62828; }
      .pq-dato { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #eee; }
      .pq-dato:last-child { border-bottom: none; }
      .pq-dato-label { color: #666; font-size: 14px; }
      .pq-dato-valor { color: #1a1a1a; font-weight: 500; text-align: right; }
      .pq-dato-destacar .pq-dato-valor { color: #d62828; font-size: 20px; font-weight: 700; }
      .pq-btn-llamar { display: block; background: #16a34a; color: white; text-align: center; text-decoration: none; padding: 18px; border-radius: 10px; font-size: 20px; font-weight: 700; margin: 8px 0; }
      .pq-btn-notificar { width: 100%; padding: 14px; background: #d62828; color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; }
      .pq-btn-notificar:disabled { opacity: .6; cursor: default; }
      .pq-notif-help { color: #888; font-size: 13px; margin-top: 8px; text-align: center; }
      .pq-notificado { background: #d1fae5; color: #047857; padding: 14px; border-radius: 10px; text-align: center; font-weight: 600; }
      .pq-error { color: #d62828; margin-top: 8px; }
      .pq-otros-contactos { margin-top: 16px; }
      .pq-otros-contactos h4 { margin: 0 0 8px; font-size: 14px; color: #555; }
      .pq-contacto-extra { display: block; padding: 8px; color: #1f2937; text-decoration: none; border-bottom: 1px solid #f0f0f0; }
      .pq-footer { text-align: center; padding: 12px; font-size: 13px; color: #666; }
      .pq-center { display: flex; justify-content: center; padding: 40px; }
      .pq-spinner { width: 36px; height: 36px; border: 3px solid #eee; border-top-color: #d62828; border-radius: 50%; animation: pq-spin 0.8s linear infinite; }
      @keyframes pq-spin { to { transform: rotate(360deg); } }
    `}</style>
  );
}
