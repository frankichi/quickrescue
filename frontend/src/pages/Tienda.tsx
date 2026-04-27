import { FormEvent, useEffect, useState } from 'react';
import * as compraSvc from '../services/compra.service';
import * as familiarSvc from '../services/familiar.service';
import * as mascotaSvc from '../services/mascota.service';
import * as usuarioSvc from '../services/usuario.service';
import {
  Producto, Compra, ProductoQR, DestinatarioTipo,
  Familiar, Mascota, Usuario,
} from '../types';
import { errorMessage } from '../services/api';

const ICONO: Record<ProductoQR, string> = {
  collar:  '📿',
  pulsera: '⌚',
  llavero: '🔑',
};

const ESTADO_BADGE: Record<Compra['estado'], string> = {
  pendiente:  'warning',
  confirmado: 'success',
  enviado:    'success',
  entregado:  'success',
  cancelado:  'danger',
};

export default function Tienda() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [familiares, setFamiliares] = useState<Familiar[]>([]);
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [cargando, setCargando] = useState(true);
  const [err, setErr] = useState('');
  const [comprando, setComprando] = useState<Producto | null>(null);

  const cargar = async () => {
    setCargando(true);
    try {
      const [p, c, u, fs, ms] = await Promise.all([
        compraSvc.listarProductos(),
        compraSvc.listarCompras(),
        usuarioSvc.obtenerMiPerfil(),
        familiarSvc.listar(),
        mascotaSvc.listar(),
      ]);
      setProductos(p);
      setCompras(c);
      setUsuario(u);
      setFamiliares(fs);
      setMascotas(ms);
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  return (
    <div>
      <h1 className="page-title">🛒 Tienda Quick Rescue</h1>
      <p style={{ color: '#7F8C8D', marginTop: -8 }}>
        Adquiere identificadores QR físicos para tus seres queridos.
      </p>

      {err && <div className="error-msg">{err}</div>}

      <div style={{
        display: 'grid', gap: 16,
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        marginBottom: 32,
      }}>
        {productos.map((p) => (
          <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 64, textAlign: 'center', margin: '8px 0 16px' }}>
              {ICONO[p.id]}
            </div>
            <h3 style={{ margin: 0, color: '#2C3E50' }}>{p.nombre}</h3>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#5BA0D0', margin: '4px 0 12px' }}>
              S/ {p.precio.toFixed(2)}
            </div>
            <p style={{ color: '#7F8C8D', flex: 1 }}>{p.descripcion}</p>
            <button className="primary" onClick={() => setComprando(p)}>Comprar</button>
          </div>
        ))}
      </div>

      <h2 style={{ color: '#2C3E50', fontSize: 18 }}>Mis compras</h2>
      {cargando ? <div className="loader">Cargando…</div>
      : compras.length === 0 ? <div className="empty">Aún no realizaste compras.</div>
      : (
        <table className="table">
          <thead>
            <tr><th>Producto</th><th>Para</th><th>Fecha</th><th>Precio</th><th>Estado</th></tr>
          </thead>
          <tbody>
            {compras.map((c) => (
              <tr key={c.id}>
                <td>{ICONO[c.producto]} {c.producto_nombre}</td>
                <td>{c.destinatario_nombre} <small style={{ color: '#7F8C8D' }}>({c.destinatario_tipo})</small></td>
                <td>{new Date(c.creado_en).toLocaleDateString('es-PE')}</td>
                <td>S/ {Number(c.precio).toFixed(2)}</td>
                <td><span className={`badge ${ESTADO_BADGE[c.estado]}`}>{c.estado}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {comprando && (
        <ModalCompra
          producto={comprando}
          usuario={usuario}
          familiares={familiares}
          mascotas={mascotas}
          onClose={() => setComprando(null)}
          onSuccess={() => { setComprando(null); cargar(); }}
        />
      )}
    </div>
  );
}

interface ModalProps {
  producto: Producto;
  usuario: Usuario | null;
  familiares: Familiar[];
  mascotas: Mascota[];
  onClose: () => void;
  onSuccess: () => void;
}

function ModalCompra({ producto, usuario, familiares, mascotas, onClose, onSuccess }: ModalProps) {
  const [destValue, setDestValue] = useState<string>('');
  const [notas, setNotas] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [err, setErr] = useState('');
  const [exito, setExito] = useState(false);

  const opciones: Array<{ value: string; label: string; tipo: DestinatarioTipo; id: number }> = [
    ...(usuario ? [{ value: `usuario-${usuario.id}`,  label: `Yo (${usuario.nombre} ${usuario.apellido})`, tipo: 'usuario' as DestinatarioTipo,  id: usuario.id }] : []),
    ...familiares.map((f) => ({ value: `familiar-${f.id}`, label: `👨‍👩‍👧 ${f.nombre} (${f.relacion})`, tipo: 'familiar' as DestinatarioTipo, id: f.id })),
    ...mascotas  .map((m) => ({ value: `mascota-${m.id}`,  label: `🐾 ${m.nombre} (${m.especie})`,         tipo: 'mascota'  as DestinatarioTipo, id: m.id })),
  ];

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (!destValue) { setErr('Selecciona para quién es'); return; }
    const opt = opciones.find(o => o.value === destValue)!;
    setErr(''); setEnviando(true);
    try {
      await compraSvc.crearCompra({
        producto: producto.id,
        destinatario_tipo: opt.tipo,
        destinatario_id:   opt.id,
        notas: notas || undefined,
      });
      setExito(true);
      setTimeout(onSuccess, 1500);
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(44,62,80,.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: 12, padding: 24, maxWidth: 460, width: '92%',
      }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0 }}>Comprar {producto.nombre}</h3>
        <p style={{ color: '#5BA0D0', fontWeight: 700, fontSize: 18 }}>S/ {producto.precio.toFixed(2)}</p>

        {exito ? (
          <div className="success-msg" style={{ textAlign: 'center', padding: 16 }}>
            ✓ Pedido recibido, te contactaremos por WhatsApp para coordinar entrega.
          </div>
        ) : (
          <form onSubmit={enviar}>
            <label>¿Para quién?</label>
            <select value={destValue} onChange={(e) => setDestValue(e.target.value)} required>
              <option value="">Selecciona…</option>
              {opciones.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <label>Notas (opcional)</label>
            <textarea rows={3} value={notas} onChange={(e) => setNotas(e.target.value)}
                      placeholder="Color preferido, talla, etc." />
            {err && <p className="error-msg">{err}</p>}
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button type="submit" className="primary" disabled={enviando}>
                {enviando ? 'Enviando…' : 'Confirmar pedido'}
              </button>
              <button type="button" className="primary" style={{ background: '#7F8C8D' }} onClick={onClose}>
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
