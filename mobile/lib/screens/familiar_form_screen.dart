import 'package:flutter/material.dart';
import '../models/familiar.dart';
import '../services/familiar_service.dart';

class FamiliarFormScreen extends StatefulWidget {
  const FamiliarFormScreen({super.key});
  @override State<FamiliarFormScreen> createState() => _FamiliarFormScreenState();
}

class _FamiliarFormScreenState extends State<FamiliarFormScreen> {
  final _form = GlobalKey<FormState>();
  final _nombre   = TextEditingController();
  final _relacion = TextEditingController();
  final _telefono = TextEditingController();
  final _email    = TextEditingController();
  Familiar? _editando;
  bool _guardando = false;
  String? _err;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_editando == null) {
      final args = ModalRoute.of(context)?.settings.arguments;
      if (args is Familiar) {
        _editando = args;
        _nombre.text   = args.nombre;
        _relacion.text = args.relacion;
        _telefono.text = args.telefono;
        _email.text    = args.email ?? '';
      }
    }
  }

  @override
  void dispose() {
    _nombre.dispose(); _relacion.dispose();
    _telefono.dispose(); _email.dispose();
    super.dispose();
  }

  Future<void> _guardar() async {
    if (!_form.currentState!.validate()) return;
    setState(() { _guardando = true; _err = null; });
    final payload = {
      'nombre':   _nombre.text.trim(),
      'relacion': _relacion.text.trim(),
      'telefono': _telefono.text.trim(),
      if (_email.text.trim().isNotEmpty) 'email': _email.text.trim(),
    };
    try {
      if (_editando != null) {
        await FamiliarService.actualizar(_editando!.id, payload);
      } else {
        await FamiliarService.crear(payload);
      }
      if (mounted) Navigator.pop(context, true);
    } catch (e) {
      setState(() => _err = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _guardando = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_editando != null ? 'Editar familiar' : 'Nuevo familiar'),
        backgroundColor: const Color(0xFFD62828),
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _form,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextFormField(
                controller: _nombre,
                textCapitalization: TextCapitalization.words,
                decoration: const InputDecoration(labelText: 'Nombre completo', border: OutlineInputBorder()),
                validator: (v) => (v == null || v.trim().isEmpty) ? 'Requerido' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _relacion,
                decoration: const InputDecoration(labelText: 'Relación (Hijo, Esposa, etc.)', border: OutlineInputBorder()),
                validator: (v) => (v == null || v.trim().isEmpty) ? 'Requerido' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _telefono,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(labelText: 'Teléfono', border: OutlineInputBorder()),
                validator: (v) => (v == null || v.trim().isEmpty) ? 'Requerido' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _email,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(labelText: 'Email (opcional)', border: OutlineInputBorder()),
              ),
              if (_err != null) ...[
                const SizedBox(height: 12),
                Text(_err!, style: const TextStyle(color: Colors.red)),
              ],
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: _guardando ? null : _guardar,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFD62828),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
                child: _guardando
                  ? const SizedBox(width: 20, height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : Text(_editando != null ? 'Actualizar' : 'Crear', style: const TextStyle(fontSize: 16)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
