import 'package:flutter/material.dart';
import '../models/mascota.dart';
import '../services/mascota_service.dart';

const _ESPECIES = ['perro', 'gato', 'otro'];

class MascotaFormScreen extends StatefulWidget {
  const MascotaFormScreen({super.key});
  @override State<MascotaFormScreen> createState() => _MascotaFormScreenState();
}

class _MascotaFormScreenState extends State<MascotaFormScreen> {
  final _form = GlobalKey<FormState>();
  final _nombre    = TextEditingController();
  final _raza      = TextEditingController();
  final _color     = TextEditingController();
  final _edad      = TextEditingController();
  final _foto      = TextEditingController();
  final _microchip = TextEditingController();
  final _msgPerdida = TextEditingController();
  String _especie = 'perro';
  bool _perdida = false;
  Mascota? _editando;
  bool _guardando = false;
  String? _err;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_editando == null) {
      final args = ModalRoute.of(context)?.settings.arguments;
      if (args is Mascota) {
        _editando = args;
        _nombre.text     = args.nombre;
        _especie         = args.especie;
        _raza.text       = args.raza      ?? '';
        _color.text      = args.color     ?? '';
        _edad.text       = args.edadAnios?.toString() ?? '';
        _foto.text       = args.foto      ?? '';
        _microchip.text  = args.microchip ?? '';
        _perdida         = args.perdida;
        _msgPerdida.text = args.mensajePerdida ?? '';
      }
    }
  }

  @override
  void dispose() {
    for (final c in [_nombre, _raza, _color, _edad, _foto, _microchip, _msgPerdida]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _guardar() async {
    if (!_form.currentState!.validate()) return;
    setState(() { _guardando = true; _err = null; });
    final payload = <String, dynamic>{
      'nombre':     _nombre.text.trim(),
      'especie':    _especie,
      'raza':       _raza.text.trim().isEmpty ? null : _raza.text.trim(),
      'color':      _color.text.trim().isEmpty ? null : _color.text.trim(),
      'edad_anios': _edad.text.trim().isEmpty ? null : int.tryParse(_edad.text.trim()),
      'foto':       _foto.text.trim().isEmpty ? null : _foto.text.trim(),
      'microchip':  _microchip.text.trim().isEmpty ? null : _microchip.text.trim(),
      'perdida':    _perdida,
      'mensaje_perdida': _perdida && _msgPerdida.text.trim().isNotEmpty
          ? _msgPerdida.text.trim() : null,
    };
    try {
      if (_editando != null) {
        await MascotaService.actualizar(_editando!.id, payload);
      } else {
        await MascotaService.crear(payload);
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
        title: Text(_editando != null ? 'Editar mascota' : 'Nueva mascota'),
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
                decoration: const InputDecoration(labelText: 'Nombre', border: OutlineInputBorder()),
                validator: (v) => (v == null || v.trim().isEmpty) ? 'Requerido' : null,
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: _especie,
                items: _ESPECIES.map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
                onChanged: (v) => setState(() => _especie = v ?? 'perro'),
                decoration: const InputDecoration(labelText: 'Especie', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _raza,
                decoration: const InputDecoration(labelText: 'Raza (opcional)', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _color,
                decoration: const InputDecoration(labelText: 'Color (opcional)', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _edad,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Edad (años, opcional)', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _foto,
                decoration: const InputDecoration(labelText: 'Foto (URL, opcional)', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _microchip,
                decoration: const InputDecoration(labelText: 'Microchip (opcional)', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 12),
              SwitchListTile(
                value: _perdida,
                onChanged: (v) => setState(() => _perdida = v),
                title: const Text('Marcar como perdida'),
              ),
              if (_perdida)
                TextFormField(
                  controller: _msgPerdida,
                  maxLines: 3,
                  decoration: const InputDecoration(
                    labelText: 'Mensaje para quien la encuentre',
                    border: OutlineInputBorder(),
                  ),
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
