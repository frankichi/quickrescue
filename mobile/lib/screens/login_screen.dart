import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../config/app_config.dart';
import '../services/auth_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  // Mensajes progresivos del botón cargando.
  static const _msgInicial = 'Conectando…';
  static const _msg8s      = 'Despertando servidor…';
  static const _msg30s     = 'Esto está tardando demasiado, verifica tu conexión';

  final _form = GlobalKey<FormState>();
  final _email = TextEditingController();
  final _pass  = TextEditingController();
  bool _cargando = false;
  String? _error;
  String _txtCargando = _msgInicial;
  final List<Timer> _timers = [];

  @override
  void dispose() {
    for (final t in _timers) { t.cancel(); }
    _timers.clear();
    _email.dispose(); _pass.dispose();
    super.dispose();
  }

  void _cancelarTimers() {
    for (final t in _timers) { t.cancel(); }
    _timers.clear();
  }

  void _arrancarMensajesProgresivos() {
    void programar(Duration d, String txt) {
      _timers.add(Timer(d, () {
        if (mounted && _cargando) setState(() => _txtCargando = txt);
      }));
    }
    programar(const Duration(seconds: 8),  _msg8s);
    programar(const Duration(seconds: 30), _msg30s);
  }

  Future<void> _login() async {
    if (!_form.currentState!.validate()) return;
    setState(() {
      _cargando = true;
      _error = null;
      _txtCargando = _msgInicial;
    });
    _cancelarTimers();
    _arrancarMensajesProgresivos();

    try {
      await AuthService.login(_email.text.trim(), _pass.text);
      if (!mounted) return;
      Navigator.pushReplacementNamed(context, '/home');
    } catch (e, stack) {
      if (!mounted) return;
      setState(() => _error = _detallarError(e));
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          duration: const Duration(seconds: 8),
          backgroundColor: Colors.red.shade900,
          content: Text(
            '${e.runtimeType}\n→ ${AppConfig.apiBaseUrl}\n${e.toString()}',
            style: const TextStyle(fontSize: 12, color: Colors.white),
          ),
          action: SnackBarAction(
            label: 'Stack',
            textColor: Colors.white,
            onPressed: () => _mostrarStackTrace(e, stack),
          ),
        ),
      );
    } finally {
      _cancelarTimers();
      if (mounted) setState(() => _cargando = false);
    }
  }

  String _detallarError(Object e) {
    final tipo = e.runtimeType.toString();
    final url  = AppConfig.apiBaseUrl;
    String contexto;
    if (e is TimeoutException) {
      contexto = 'El servidor no respondió a tiempo (timeout ${AppConfig.httpTimeout.inSeconds}s).';
    } else if (e is SocketException) {
      contexto = 'Error de red — verifica tu conexión a internet.';
    } else if (e is FormatException) {
      contexto = 'Respuesta del servidor inválida (FormatException). ¿La URL apunta a un backend correcto?';
    } else {
      contexto = e.toString();
    }
    return '$contexto\n\n[$tipo @ $url]';
  }

  void _mostrarStackTrace(Object e, StackTrace stack) {
    final txt = '${e.runtimeType}: $e\n\n$stack';
    showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Stack trace'),
        content: SingleChildScrollView(
          child: SelectableText(txt,
              style: const TextStyle(fontSize: 11, fontFamily: 'monospace')),
        ),
        actions: [
          TextButton.icon(
            icon: const Icon(Icons.copy),
            label: const Text('Copiar'),
            onPressed: () async {
              await Clipboard.setData(ClipboardData(text: txt));
              if (ctx.mounted) Navigator.pop(ctx);
            },
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cerrar'),
          ),
        ],
      ),
    );
  }

  void _abrirDebugDialog() {
    final info = AppConfig.debugInfo();
    showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Debug info'),
        content: SelectableText(info,
            style: const TextStyle(fontSize: 13, fontFamily: 'monospace')),
        actions: [
          TextButton.icon(
            icon: const Icon(Icons.copy),
            label: const Text('Copy to clipboard'),
            onPressed: () async {
              await Clipboard.setData(ClipboardData(text: info));
              if (ctx.mounted) {
                ScaffoldMessenger.of(ctx).showSnackBar(
                  const SnackBar(content: Text('Copiado')),
                );
                Navigator.pop(ctx);
              }
            },
          ),
          TextButton(
            onPressed: () { Navigator.pop(ctx); Navigator.pushNamed(context, '/diagnostic'); },
            child: const Text('Diagnóstico avanzado'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cerrar'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Stack(
          children: [
            Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Form(
                  key: _form,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Icon(Icons.health_and_safety,
                                 size: 64, color: Color(0xFFD62828)),
                      const SizedBox(height: 16),
                      const Text('Quick Rescue', textAlign: TextAlign.center,
                                 style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 32),
                      TextFormField(
                        controller: _email,
                        keyboardType: TextInputType.emailAddress,
                        decoration: const InputDecoration(
                          labelText: 'Correo electrónico',
                          border: OutlineInputBorder(),
                        ),
                        validator: (v) =>
                            (v == null || !v.contains('@')) ? 'Email inválido' : null,
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _pass,
                        obscureText: true,
                        decoration: const InputDecoration(
                          labelText: 'Contraseña',
                          border: OutlineInputBorder(),
                        ),
                        validator: (v) =>
                            (v == null || v.length < 8) ? 'Mínimo 8 caracteres' : null,
                      ),
                      if (_error != null) ...[
                        const SizedBox(height: 12),
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: Colors.red.shade50,
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: const Color(0xFFD62828)),
                          ),
                          child: SelectableText(_error!,
                              style: const TextStyle(color: Color(0xFFD62828), fontSize: 13)),
                        ),
                      ],
                      const SizedBox(height: 20),
                      ElevatedButton(
                        onPressed: _cargando ? null : _login,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFD62828),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                        ),
                        child: _cargando
                          ? Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const SizedBox(width: 18, height: 18,
                                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)),
                                const SizedBox(width: 12),
                                Flexible(
                                  child: Text(
                                    _txtCargando,
                                    style: const TextStyle(fontSize: 14),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            )
                          : const Text('Ingresar', style: TextStyle(fontSize: 16)),
                      ),
                      const SizedBox(height: 16),
                      TextButton(
                        onPressed: _cargando
                          ? null
                          : () => Navigator.pushNamed(context, '/register'),
                        child: const Text('¿No tienes cuenta? Regístrate'),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            // Botón de bug en esquina superior derecha, visible sin login.
            Positioned(
              top: 8, right: 8,
              child: IconButton(
                icon: const Icon(Icons.bug_report, color: Color(0xFFD62828)),
                tooltip: 'Debug',
                onPressed: _abrirDebugDialog,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
