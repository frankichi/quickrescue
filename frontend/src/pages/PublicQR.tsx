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
  const [statusError, setStatusError] = useState<number | null>(null);
  const [notificando, setNotificando] = useState(false);
  const [notificado, setNotificado] = useState(false);
  const [notifErr, setNotifErr] = useState('');

  const tipoValido = (TIPOS_VALIDOS as string[]).includes(tipo ?? '');
  const idNum = parseInt(id ?? '', 10);

  useEffect(() => {
    if (!tipoValido || !Number.isInteger(idNum) || idNum < 1) {
      setCargando(false);
      setStatusError(404);
      setErr('QR no válido o expirado');
      return;
    }
    qrSvc.obtenerPerfil(tipo as TipoQR, idNum)
      .then(setPerfil)
      .catch((e) => {
        const status = (e as { response?: { status?: number } })?.response?.status ?? null;
        setStatusError(status);
        setErr(status === 404
          ? 'QR no válido o expirado'
          : `No se pudo cargar la información, intenta de nuevo. (${errorMessage(e)})`);
      })
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
      () => enviar(), // si niega, igual avisamos al titular
      { timeout: 10_000, enableHighAccuracy: false },
    );
  };

  if (cargando) return <Layout><Loader /></Layout>;
  if (err || !perfil) {
    return (
      <Layout>
        <div className="pq-card">
          <h2 style={{ margin: 0, color: '#E74C3C' }}>
            {statusError === 404 ? '❌ QR no válido o expirado' : '⚠ No pudimos cargar la información'}
          </h2>
          <p style={{ color: '#7F8C8D' }}>
            {statusError === 404
              ? 'Este código QR no existe o el titular cerró su cuenta.'
              : err}
          </p>
        </div>
      </Layout>
    );
  }

  const tel = perfil.contacto.telefono;
  const esMascota = perfil.tipo === 'mascota';

  return (
    <Layout>
      <div className="pq-card">
        <Foto src={perfil.foto} alt={perfil.nombre} />

        {esMascota
          ? <BloqueMascota perfil={perfil} />
          : <BloqueUsuarioOFamiliar perfil={perfil} />}

        {/* CONTACTO TITULAR + BOTONES */}
        <section className="pq-section">
          <h3>Contacto del titular</h3>
          <p style={{ marginBottom: 12 }}>
            <strong>{perfil.contacto.nombre}</strong>
          </p>
          {tel
            ? <a href={`tel:${tel}`} className="pq-btn-llamar">📞 Llamar al titular</a>
            : <p style={{ color: '#7F8C8D' }}>El titular no tiene teléfono de contacto cargado.</p>}

          {notificado
            ? <div className="pq-notificado">✓ Notificamos al titular</div>
            : <>
                <button
                  className="pq-btn-notificar"
                  onClick={notificarUbicacion}
                  disabled={notificando}
                >
                  {notificando ? 'Enviando…' : `📍 Notificar al titular dónde estoy`}
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

// ----------------------- helpers de presentación -----------------------

function Foto({ src, alt }: { src: string | null | undefined; alt: string }) {
  return (
    <div className="pq-foto-wrap">
      {src
        ? <img src={src} alt={alt} className="pq-foto" />
        : <div className="pq-foto pq-foto-placeholder">👤</div>}
    </div>
  );
}

function BloqueUsuarioOFamiliar({ perfil }: { perfil: Extract<PerfilPublico, { tipo: 'usuario' | 'familiar' }> }) {
  const tieneAlgunDatoMedico = perfil.grupo_sanguineo || perfil.alergias || perfil.enfermedades || perfil.medicamentos;
  const nombreCompleto = perfil.apellido ? `${perfil.nombre} ${perfil.apellido}` : perfil.nombre;
  return (
    <>
      <h1 className="pq-nombre">{nombreCompleto}</h1>
      {perfil.dni && <p className="pq-meta">DNI: {perfil.dni}</p>}
      {perfil.edad != null && <p className="pq-meta">{perfil.edad} años</p>}

      {tieneAlgunDatoMedico && (
        <section className="pq-section">
          <h3>Información médica</h3>
          {perfil.grupo_sanguineo && (
            <div className="pq-grupo-sanguineo">
              <span className="pq-gs-label">Grupo sanguíneo</span>
              <span className="pq-gs-badge">{perfil.grupo_sanguineo}</span>
            </div>
          )}
          {perfil.alergias     && <CardMed icono="⚠️" titulo="Alergias"     valor={perfil.alergias} />}
          {perfil.enfermedades && <CardMed icono="🩺" titulo="Enfermedades" valor={perfil.enfermedades} />}
          {perfil.medicamentos && <CardMed icono="💊" titulo="Medicamentos" valor={perfil.medicamentos} />}
        </section>
      )}
    </>
  );
}

function BloqueMascota({ perfil }: { perfil: Extract<PerfilPublico, { tipo: 'mascota' }> }) {
  const partes: string[] = [];
  if (perfil.distrito) partes.push(`Soy de ${perfil.distrito}`);
  if (perfil.edad_anios != null) partes.push(`tengo ${perfil.edad_anios} año${perfil.edad_anios === 1 ? '' : 's'}`);
  const presentacion = `¡Hola! Me llamo ${perfil.nombre}.${partes.length > 0 ? ' ' + partes.join(', ') + '.' : ''}`;

  return (
    <>
      <h1 className="pq-nombre">{perfil.nombre}</h1>
      <p className="pq-meta">
        {perfil.especie}{perfil.raza ? ` • ${perfil.raza}` : ''}
      </p>

      {perfil.perdida && (
        <div className="pq-alerta-perdida">
          🚨 Esta mascota está reportada como <strong>PERDIDA</strong>.
        </div>
      )}

      <section className="pq-section">
        <p className="pq-presentacion">{presentacion}</p>
        {perfil.descripcion && <p className="pq-presentacion">{perfil.descripcion}</p>}
        {perfil.color && <p className="pq-meta">Color: {perfil.color}</p>}
      </section>
    </>
  );
}

function CardMed({ icono, titulo, valor }: { icono: string; titulo: string; valor: string }) {
  return (
    <div className="pq-card-med">
      <div className="pq-card-med-titulo"><span>{icono}</span> {titulo}</div>
      <div className="pq-card-med-valor">{valor}</div>
    </div>
  );
}

function Loader() {
  return <div className="pq-center"><div className="pq-spinner" /></div>;
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
      .pq-page { min-height: 100vh; background: #F8F9FA; display: flex; flex-direction: column; color: #2C3E50; }
      .pq-header { background: #5BA0D0; color: white; padding: 14px 20px; font-weight: 700; font-size: 18px; display: flex; align-items: center; gap: 10px; }
      .pq-logo-dot { width: 14px; height: 14px; background: white; border-radius: 50%; display: inline-block; }
      .pq-main { flex: 1; padding: 16px; display: flex; justify-content: center; }
      .pq-card { background: white; border-radius: 12px; box-shadow: 0 4px 14px rgba(44,62,80,.08); padding: 24px; max-width: 480px; width: 100%; }

      .pq-foto-wrap { display: flex; justify-content: center; margin-bottom: 12px; }
      .pq-foto { width: 150px; height: 150px; border-radius: 50%; object-fit: cover; border: 4px solid #5BA0D0; background: #F8F9FA; }
      .pq-foto-placeholder { display: flex; align-items: center; justify-content: center; font-size: 64px; color: #BDC3C7; }

      .pq-nombre { text-align: center; font-size: 26px; margin: 8px 0 2px; color: #2C3E50; }
      .pq-meta { text-align: center; color: #7F8C8D; margin: 0 0 8px; font-size: 15px; }
      .pq-presentacion { font-size: 16px; line-height: 1.5; text-align: center; color: #2C3E50; margin: 8px 0; }

      .pq-alerta-perdida { background: #FFF8E1; border: 1px solid #F4D03F; border-radius: 8px; padding: 12px; margin: 12px 0; color: #7D6608; text-align: center; }

      .pq-section { border-top: 1px solid #E3E9EF; padding-top: 16px; margin-top: 16px; }
      .pq-section h3 { margin: 0 0 12px; font-size: 17px; color: #5BA0D0; }

      .pq-grupo-sanguineo { display: flex; align-items: center; justify-content: space-between; padding: 12px; background: #E8F1F9; border-radius: 8px; margin-bottom: 10px; }
      .pq-gs-label { color: #2C3E50; font-weight: 600; }
      .pq-gs-badge { background: #5BA0D0; color: white; font-size: 22px; font-weight: 700; padding: 6px 16px; border-radius: 8px; }

      .pq-card-med { background: #F8F9FA; padding: 10px 12px; border-radius: 8px; margin-bottom: 8px; border-left: 3px solid #5BA0D0; }
      .pq-card-med-titulo { font-size: 13px; color: #7F8C8D; margin-bottom: 2px; }
      .pq-card-med-valor { font-size: 15px; color: #2C3E50; }

      .pq-btn-llamar { display: block; background: #27AE60; color: white; text-align: center; text-decoration: none; padding: 18px; border-radius: 10px; font-size: 20px; font-weight: 700; margin: 8px 0; }
      .pq-btn-notificar { width: 100%; padding: 14px; background: #5BA0D0; color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; margin-top: 12px; }
      .pq-btn-notificar:disabled { opacity: .6; cursor: default; }

      .pq-notif-help { color: #7F8C8D; font-size: 13px; margin-top: 8px; text-align: center; }
      .pq-notificado { background: #D4EDDA; color: #155724; padding: 14px; border-radius: 10px; text-align: center; font-weight: 600; margin-top: 12px; }
      .pq-error { color: #E74C3C; margin-top: 8px; }
      .pq-footer { text-align: center; padding: 16px; font-size: 13px; color: #7F8C8D; border-top: 1px solid #E3E9EF; }

      .pq-center { display: flex; justify-content: center; padding: 40px; }
      .pq-spinner { width: 36px; height: 36px; border: 3px solid #E3E9EF; border-top-color: #5BA0D0; border-radius: 50%; animation: pq-spin 0.8s linear infinite; }
      @keyframes pq-spin { to { transform: rotate(360deg); } }
    `}</style>
  );
}
