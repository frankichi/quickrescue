import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:permission_handler/permission_handler.dart';

class QrScannerScreen extends StatefulWidget {
  const QrScannerScreen({super.key});
  @override State<QrScannerScreen> createState() => _QrScannerScreenState();
}

class _QrScannerScreenState extends State<QrScannerScreen> {
  final MobileScannerController _ctrl = MobileScannerController(
    detectionSpeed: DetectionSpeed.noDuplicates,
    facing: CameraFacing.back,
  );
  bool _permitido = false;
  bool _yaProcesado = false;
  bool _torchOn = false;

  @override
  void initState() {
    super.initState();
    _pedirPermiso();
  }

  Future<void> _pedirPermiso() async {
    final estado = await Permission.camera.request();
    if (!mounted) return;
    if (estado.isGranted) {
      setState(() => _permitido = true);
    } else if (estado.isPermanentlyDenied) {
      _mostrarDialogo(
        titulo: 'Permiso de cámara denegado',
        mensaje: 'Ve a Ajustes y habilita la cámara para escanear QR.',
        accion: 'Abrir ajustes',
        onAccion: openAppSettings,
      );
    } else {
      _mostrarDialogo(
        titulo: 'Cámara requerida',
        mensaje: 'Sin acceso a la cámara no se puede escanear el QR.',
      );
    }
  }

  void _mostrarDialogo({
    required String titulo,
    required String mensaje,
    String? accion,
    VoidCallback? onAccion,
  }) {
    showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(titulo),
        content: Text(mensaje),
        actions: [
          TextButton(
            onPressed: () { Navigator.pop(ctx); Navigator.pop(context); },
            child: const Text('Cerrar'),
          ),
          if (accion != null)
            ElevatedButton(
              onPressed: () { Navigator.pop(ctx); onAccion?.call(); },
              child: Text(accion),
            ),
        ],
      ),
    );
  }

  /// Intenta extraer el ID público de la URL del QR.
  /// Acepta:
  ///   https://quickrescue.vercel.app/qr/<id>
  ///   https://*/usuarios/<id>/publico
  int? _extraerIdDeUrl(String texto) {
    final s = texto.trim();
    Uri? uri;
    try { uri = Uri.parse(s); } catch (_) { return null; }
    if (!uri.isAbsolute) return null;

    final segs = uri.pathSegments;
    for (var i = 0; i < segs.length - 1; i++) {
      // .../qr/<id>
      if (segs[i] == 'qr') {
        final n = int.tryParse(segs[i + 1]);
        if (n != null) return n;
      }
      // .../usuarios/<id>/publico
      if (segs[i] == 'usuarios' && i + 2 < segs.length && segs[i + 2] == 'publico') {
        final n = int.tryParse(segs[i + 1]);
        if (n != null) return n;
      }
    }
    return null;
  }

  Future<void> _onDetect(BarcodeCapture capture) async {
    if (_yaProcesado) return;
    final raw = capture.barcodes.first.rawValue;
    if (raw == null || raw.isEmpty) return;

    _yaProcesado = true;
    await _ctrl.stop();

    final id = _extraerIdDeUrl(raw);
    if (!mounted) return;

    if (id != null) {
      Navigator.pushReplacementNamed(context, '/qr-detail', arguments: id);
      return;
    }

    // QR de contenido genérico
    final copiar = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Código QR detectado'),
        content: SingleChildScrollView(
          child: SelectableText(raw, style: const TextStyle(fontSize: 14)),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cerrar'),
          ),
          ElevatedButton.icon(
            icon: const Icon(Icons.copy),
            label: const Text('Copiar'),
            onPressed: () => Navigator.pop(ctx, true),
          ),
        ],
      ),
    );
    if (!mounted) return;
    if (copiar == true) {
      await Clipboard.setData(ClipboardData(text: raw));
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Copiado al portapapeles')),
        );
      }
    }
    _yaProcesado = false;
    await _ctrl.start();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Escanear QR'),
        backgroundColor: const Color(0xFFD62828),
        foregroundColor: Colors.white,
      ),
      body: !_permitido
        ? const Center(
            child: Padding(
              padding: EdgeInsets.all(24),
              child: Text(
                'Esperando permiso de cámara…',
                textAlign: TextAlign.center,
              ),
            ),
          )
        : Stack(
            fit: StackFit.expand,
            children: [
              MobileScanner(controller: _ctrl, onDetect: _onDetect),
              // Cuadro guía visual
              Center(
                child: Container(
                  width: 240, height: 240,
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.white, width: 3),
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
              ),
              const Positioned(
                bottom: 80, left: 16, right: 16,
                child: Text(
                  'Apunta la cámara al código QR',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    shadows: [Shadow(color: Colors.black, blurRadius: 4)],
                  ),
                ),
              ),
            ],
          ),
      floatingActionButton: !_permitido ? null : FloatingActionButton(
        backgroundColor: const Color(0xFFD62828),
        onPressed: () async {
          await _ctrl.toggleTorch();
          setState(() => _torchOn = !_torchOn);
        },
        child: Icon(_torchOn ? Icons.flash_on : Icons.flash_off,
                    color: Colors.white),
      ),
    );
  }
}
