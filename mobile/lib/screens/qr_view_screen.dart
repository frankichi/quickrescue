import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:share_plus/share_plus.dart';
import '../config/app_config.dart';

/// Pantalla de QR para un familiar o mascota del titular.
/// Argumentos: { 'tipo': 'familiar'|'mascota', 'id': int, 'nombre': String }
class QrViewScreen extends StatefulWidget {
  const QrViewScreen({super.key});
  @override State<QrViewScreen> createState() => _QrViewScreenState();
}

class _QrViewScreenState extends State<QrViewScreen> {
  final GlobalKey _qrKey = GlobalKey();
  String? _tipo;
  int? _id;
  String _nombre = '';

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_id != null) return;
    final args = ModalRoute.of(context)?.settings.arguments;
    if (args is Map) {
      _tipo = args['tipo'] as String?;
      _id = args['id'] as int?;
      _nombre = args['nombre'] as String? ?? '';
    }
  }

  String get _url {
    final base = AppConfig.publicWebBase;
    return '$base/qr/$_tipo/$_id';
  }

  Future<void> _compartir() async {
    try {
      final boundary = _qrKey.currentContext!.findRenderObject() as RenderRepaintBoundary;
      final ui.Image image = await boundary.toImage(pixelRatio: 3.0);
      final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
      final bytes = byteData!.buffer.asUint8List();
      // share_plus 10 soporta XFile.fromData -> evita path_provider.
      final xfile = XFile.fromData(
        bytes,
        mimeType: 'image/png',
        name: 'qr_${_tipo}_$_id.png',
      );
      await Share.shareXFiles(
        [xfile],
        text: 'QR Quick Rescue de $_nombre\n$_url',
      );
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('No se pudo compartir: $e')),
      );
    }
  }

  Future<void> _copiarUrl() async {
    await Clipboard.setData(ClipboardData(text: _url));
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('URL copiada')),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_tipo == null || _id == null) {
      return const Scaffold(body: Center(child: Text('Argumentos inválidos')));
    }
    return Scaffold(
      appBar: AppBar(
        title: Text('QR de $_nombre'),
        backgroundColor: const Color(0xFFD62828),
        foregroundColor: Colors.white,
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            const Text(
              'Imprime este QR y úsalo en pulsera/llavero/collar.\n'
              'Cualquier persona que lo escanee con la cámara nativa de su '
              'celular verá la información para contactarte.',
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            RepaintBoundary(
              key: _qrKey,
              child: Container(
                color: Colors.white,
                padding: const EdgeInsets.all(16),
                child: QrImageView(
                  data: _url,
                  version: QrVersions.auto,
                  size: 280,
                ),
              ),
            ),
            const SizedBox(height: 12),
            SelectableText(_url, style: const TextStyle(fontSize: 12, color: Colors.grey)),
            const Spacer(),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    icon: const Icon(Icons.copy),
                    label: const Text('Copiar URL'),
                    onPressed: _copiarUrl,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    icon: const Icon(Icons.share),
                    label: const Text('Compartir'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFD62828),
                      foregroundColor: Colors.white,
                    ),
                    onPressed: _compartir,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
