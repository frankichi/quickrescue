import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;
import '../config/app_config.dart';
import '../services/auth_service.dart';

class DiagnosticScreen extends StatefulWidget {
  const DiagnosticScreen({super.key});
  @override State<DiagnosticScreen> createState() => _DiagnosticScreenState();
}

class _DiagnosticScreenState extends State<DiagnosticScreen> {
  final _email = TextEditingController();
  final _pass  = TextEditingController();
  final List<_LogLine> _log = [];
  bool _ocupado = false;

  @override
  void dispose() {
    _email.dispose(); _pass.dispose(); super.dispose();
  }

  void _agregar(String txt, {bool error = false}) {
    setState(() => _log.add(_LogLine(txt, error: error)));
  }

  Future<void> _probarHealth() async {
    setState(() { _ocupado = true; });
    final url = '${AppConfig.effectiveApiUrl}/health';
    _agregar('GET $url');
    final t = Stopwatch()..start();
    try {
      final r = await http.get(Uri.parse(url))
          .timeout(const Duration(seconds: 30));
      t.stop();
      _agregar('  status=${r.statusCode}  ${t.elapsedMilliseconds}ms');
      _agregar('  body=${r.body}');
      if (r.statusCode == 200) {
        _agregar('  ✓ Conexión OK');
      } else {
        _agregar('  ✗ HTTP ${r.statusCode}', error: true);
      }
    } on TimeoutException {
      t.stop();
      _agregar('  ✗ TIMEOUT tras ${t.elapsedMilliseconds}ms (límite 30s)', error: true);
    } on SocketException catch (e) {
      t.stop();
      _agregar('  ✗ SocketException: ${e.message}', error: true);
      _agregar('  → ¿Internet OK? ¿La URL existe?', error: true);
    } catch (e) {
      t.stop();
      _agregar('  ✗ ${e.runtimeType}: $e', error: true);
    } finally {
      if (mounted) setState(() => _ocupado = false);
    }
  }

  Future<void> _probarLogin() async {
    final email = _email.text.trim();
    final pass  = _pass.text;
    if (email.isEmpty || pass.isEmpty) {
      _agregar('  ✗ Falta email/password', error: true);
      return;
    }
    setState(() { _ocupado = true; });
    _agregar('POST /auth/login  email=$email');
    final t = Stopwatch()..start();
    try {
      final u = await AuthService.login(email, pass);
      t.stop();
      _agregar('  ✓ Login OK ${t.elapsedMilliseconds}ms — uid=${u.id}');
    } catch (e, stack) {
      t.stop();
      _agregar('  ✗ ${e.runtimeType} tras ${t.elapsedMilliseconds}ms', error: true);
      _agregar('  msg: $e', error: true);
      // Stack trace abreviado
      final lineas = stack.toString().split('\n').take(8).join('\n');
      _agregar('  stack:\n$lineas', error: true);
    } finally {
      if (mounted) setState(() => _ocupado = false);
    }
  }

  Future<void> _copiarLog() async {
    final txt = '${AppConfig.debugInfo()}\n\n--- LOG ---\n'
        '${_log.map((l) => l.text).join('\n')}';
    await Clipboard.setData(ClipboardData(text: txt));
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Copiado al portapapeles')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Diagnóstico'),
        backgroundColor: const Color(0xFFD62828),
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.copy),
            tooltip: 'Copiar log completo',
            onPressed: _log.isEmpty ? null : _copiarLog,
          ),
          IconButton(
            icon: const Icon(Icons.delete_outline),
            tooltip: 'Limpiar log',
            onPressed: _log.isEmpty ? null : () => setState(() => _log.clear()),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              color: Colors.grey.shade100,
              child: SelectableText(
                AppConfig.debugInfo(),
                style: const TextStyle(fontFamily: 'monospace', fontSize: 12),
              ),
            ),
            const SizedBox(height: 12),
            ElevatedButton.icon(
              icon: const Icon(Icons.health_and_safety),
              label: const Text('Probar conexión (GET /health)'),
              onPressed: _ocupado ? null : _probarHealth,
            ),
            const SizedBox(height: 16),
            const Divider(),
            const Text('Probar login completo',
                       style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            TextField(
              controller: _email,
              keyboardType: TextInputType.emailAddress,
              decoration: const InputDecoration(
                labelText: 'Email', border: OutlineInputBorder(), isDense: true),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _pass,
              obscureText: true,
              decoration: const InputDecoration(
                labelText: 'Password', border: OutlineInputBorder(), isDense: true),
            ),
            const SizedBox(height: 8),
            ElevatedButton.icon(
              icon: const Icon(Icons.login),
              label: const Text('Probar login'),
              onPressed: _ocupado ? null : _probarLogin,
            ),
            const SizedBox(height: 12),
            const Divider(),
            const Text('Log',
                       style: TextStyle(fontWeight: FontWeight.bold)),
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(8),
                color: Colors.black,
                child: SingleChildScrollView(
                  child: SelectableText(
                    _log.isEmpty
                      ? '(sin entradas)'
                      : _log.map((l) => l.text).join('\n'),
                    style: TextStyle(
                      fontFamily: 'monospace',
                      fontSize: 11,
                      color: _log.any((l) => l.error)
                        ? Colors.orangeAccent
                        : Colors.greenAccent,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _LogLine {
  final String text;
  final bool error;
  _LogLine(this.text, {this.error = false});
}
