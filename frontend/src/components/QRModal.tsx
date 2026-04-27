import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { TipoQR } from '../types';

const PUBLIC_BASE = (import.meta.env.VITE_PUBLIC_QR_BASE as string | undefined)
  ?? window.location.origin;

interface Props {
  tipo: TipoQR;
  id: number;
  nombre: string;
  onClose: () => void;
}

export default function QRModal({ tipo, id, nombre, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dataUrl, setDataUrl] = useState<string>('');
  const url = `${PUBLIC_BASE}/qr/${tipo}/${id}`;

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, url, { width: 320, margin: 2 });
    QRCode.toDataURL(url, { width: 720, margin: 2 }).then(setDataUrl);
  }, [url]);

  const descargar = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `quickrescue-${tipo}-${id}.png`;
    a.click();
  };

  const imprimir = () => {
    if (!dataUrl) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`
      <html><head><title>QR ${nombre}</title></head>
      <body style="text-align:center;font-family:sans-serif;padding:32px;">
        <h2>${nombre}</h2>
        <img src="${dataUrl}" style="width:480px;height:480px;" />
        <p style="font-size:12px;color:#666;">${url}</p>
        <script>window.onload = () => window.print();</script>
      </body></html>
    `);
    w.document.close();
  };

  return (
    <div className="qrm-backdrop" onClick={onClose}>
      <div className="qrm-card" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ margin: '0 0 4px' }}>QR de {nombre}</h3>
        <p style={{ margin: 0, color: '#666', fontSize: 13 }}>{url}</p>
        <canvas ref={canvasRef} style={{ display: 'block', margin: '16px auto' }} />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button onClick={descargar} className="primary">⬇ Descargar PNG</button>
          <button onClick={imprimir}  className="primary"
                  style={{ background: '#374151' }}>🖨 Imprimir</button>
          <button onClick={onClose} className="primary"
                  style={{ background: '#9ca3af' }}>Cerrar</button>
        </div>
      </div>
      <style>{`
        .qrm-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .qrm-card { background: white; border-radius: 12px; padding: 24px; max-width: 420px; width: 92%; }
      `}</style>
    </div>
  );
}
