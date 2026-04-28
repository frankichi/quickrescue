import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as qrSvc from '../services/qr.service';
import {
  PerfilPublico,
  PerfilPublicoMascota,
  PerfilPublicoUsuario,
  PerfilPublicoFamiliar,
  TipoQR,
} from '../types';
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

  const tel   = perfil.contacto_titular.telefono;
  const email = perfil.contacto_titular.email;

  return (
    <Layout>
      <div className="pq-card">
        <Foto src={perfil.foto_url} alt={perfil.nombre_completo} />

        {perfil.tipo === 'mascota'
          ? <BloqueMascota perfil={perfil} />
          : <BloquePersona perfil={perfil} />}

        <DatosMedicos perfil={perfil} />

        {/* CONTACTO TITULAR + BOTONES */}
        <section className="pq-section">
          <h3>Contacto del titular</h3>
          <p style={{ marginBottom: 12 }}>
            <strong>{perfil.contacto_titular.nombre}</strong>
          </p>
          {tel
            ? <a href={`tel:${tel}`} className="pq-btn-llamar">📞 Llamar al titular</a>
            : <p style={{ color: '#7F8C8D' }}>El titular no tiene teléfono de contacto cargado.</p>}
          {email && (
            <a href={`mailto:${email}`} className="pq-btn-email">✉️ Escribir al titular</a>
          )}

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

function BloquePersona({ perfil }: { perfil: PerfilPublicoUsuario | PerfilPublicoFamiliar }) {
  const dni = perfil.tipo === 'usuario' ? perfil.dni : null;
  return (
    <>
      <h1 className="pq-nombre">{perfil.nombre_completo}</h1>
      {dni != null && <p className="pq-meta">DNI: {dni}</p>}
      {perfil.edad != null && <p className="pq-meta">{perfil.edad} años</p>}
    </>
  );
}

function BloqueMascota({ perfil }: { perfil: PerfilPublicoMascota }) {
  const partes: string[] = [];
  if (perfil.edad_anios != null) {
    partes.push(`tengo ${perfil.edad_anios} año${perfil.edad_anios === 1 ? '' : 's'}`);
  }
  const presentacion = `¡Hola! Me llamo ${perfil.nombre_completo}.${partes.length > 0 ? ' ' + partes.join(', ') + '.' : ''}`;

  return (
    <>
      <h1 className="pq-nombre">{perfil.nombre_completo}</h1>
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
        {perfil.mensaje_perdida && <p className="pq-presentacion">{perfil.mensaje_perdida}</p>}
        {perfil.color && <p className="pq-meta">Color: {perfil.color}</p>}
      </section>
    </>
  );
}

function DatosMedicos({ perfil }: { perfil: PerfilPublico }) {
  const m = perfil.datos_medicos;
  const algo = m.grupo_sanguineo || m.alergias || m.enfermedades
            || m.operaciones || m.medicamentos || m.condiciones;
  if (!algo) return null;
  return (
    <section className="pq-section">
      <h3>Información médica</h3>
      {m.grupo_sanguineo && (
        <div className="pq-grupo-sanguineo">
          <span className="pq-gs-label">Grupo sanguíneo</span>
          <span className="pq-gs-badge">{m.grupo_sanguineo}</span>
        </div>
      )}
      {m.alergias     && <CardMed icono="⚠️" titulo="Alergias"     valor={m.alergias}     destacado />}
      {m.enfermedades && <CardMed icono="🩺" titulo="Enfermedades" valor={m.enfermedades} />}
      {m.condiciones  && <CardMed icono="🐾" titulo="Condiciones"  valor={m.condiciones} />}
      {m.medicamentos && <CardMed icono="💊" titulo="Medicamentos" valor={m.medicamentos} />}
      {m.operaciones  && <CardMed icono="🏥" titulo="Operaciones"  valor={m.operaciones} />}
    </section>
  );
}

function CardMed({ icono, titulo, valor, destacado }: { icono: string; titulo: string; valor: string; destacado?: boolean }) {
  return (
    <div className={destacado ? 'pq-card-med pq-card-med-alerta' : 'pq-card-med'}>
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
      .pq-card-med-alerta { background: #FDECEA; border-left-color: #E74C3C; }
      .pq-card-med-titulo { font-size: 13px; color: #7F8C8D; margin-bottom: 2px; }
      .pq-card-med-alerta .pq-card-med-titulo { color: #C0392B; }
      .pq-card-med-valor { font-size: 15px; color: #2C3E50; }

      .pq-btn-llamar { display: block; background: #27AE60; color: white; text-align: center; text-decoration: none; padding: 18px; border-radius: 10px; font-size: 20px; font-weight: 700; margin: 8px 0; }
      .pq-btn-email { display: block; background: #5BA0D0; color: white; text-align: center; text-decoration: none; padding: 14px; border-radius: 10px; font-size: 16px; font-weight: 600; margin: 8px 0; }
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
