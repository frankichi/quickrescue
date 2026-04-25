import 'package:flutter/material.dart';
import '../services/location_service.dart';

class SosScreen extends StatefulWidget {
  const SosScreen({super.key});
  @override State<SosScreen> createState() => _SosScreenState();
}

class _SosScreenState extends State<SosScreen> {
  final _mensaje = TextEditingController();
  bool _enviando = false;
  String? _resultado;
  String? _error;

  @override
  void dispose() { _mensaje.dispose(); super.dispose(); }

  Future<void> _enviarSOS() async {
    setState(() { _enviando = true; _error = null; _resultado = null; });
    try {
      final pos  = await LocationService.obtenerPosicionActual();
      final data = await LocationService.dispararSOS(pos, mensaje: _mensaje.text);
      final n = data['familiares_notificados'] ?? 0;
      setState(() => _resultado = '✓ SOS enviado a $n familiar(es).\nTe ayudarán pronto.');
    } catch (e) {
      setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _enviando = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Activar SOS'),
        backgroundColor: const Color(0xFFD62828),
        foregroundColor: Colors.white,
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Icon(Icons.warning_amber_rounded,
                       size: 80, color: Color(0xFFD62828)),
            const SizedBox(height: 16),
            const Text(
              'Al confirmar, se enviará un email con tu ubicación '
              'actual a todos tus familiares de contacto.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 24),
            TextField(
              controller: _mensaje,
              maxLines: 3,
              maxLength: 500,
              decoration: const InputDecoration(
                labelText: 'Mensaje opcional',
                hintText: 'Ej: Me siento mal, estoy en la plaza…',
                border: OutlineInputBorder(),
              ),
            ),
            if (_resultado != null) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                color: Colors.green.shade50,
                child: Text(_resultado!,
                  style: const TextStyle(color: Color(0xFF047857), fontSize: 16)),
              ),
            ],
            if (_error != null) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                color: Colors.red.shade50,
                child: Text(_error!,
                  style: const TextStyle(color: Color(0xFFD62828))),
              ),
            ],
            const Spacer(),
            ElevatedButton(
              onPressed: _enviando ? null : _enviarSOS,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFD62828),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 18),
              ),
              child: _enviando
                ? const SizedBox(width: 20, height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                : const Text('🆘  CONFIRMAR Y ENVIAR  🆘',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ),
            const SizedBox(height: 8),
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancelar'),
            ),
          ],
        ),
      ),
    );
  }
}
