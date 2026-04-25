import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../services/api_service.dart';

class QrDetailScreen extends StatefulWidget {
  const QrDetailScreen({super.key});
  @override State<QrDetailScreen> createState() => _QrDetailScreenState();
}

class _QrDetailScreenState extends State<QrDetailScreen> {
  Map<String, dynamic>? _perfil;
  bool _cargando = true;
  String? _error;
  int? _id;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_id == null) {
      final args = ModalRoute.of(context)?.settings.arguments;
      if (args is int) {
        _id = args;
        _cargar();
      } else {
        setState(() {
          _cargando = false;
          _error = 'QR no válido';
        });
      }
    }
  }

  Future<void> _cargar() async {
    try {
      final data = await ApiService.get('/usuarios/$_id/publico', conAuth: false)
          as Map<String, dynamic>;
      if (mounted) setState(() { _perfil = data; _cargando = false; });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _cargando = false;
        _error = e.toString().contains('404') || e.toString().toLowerCase().contains('no disponible')
          ? 'QR no válido'
          : e.toString().replaceFirst('Exception: ', '');
      });
    }
  }

  Future<void> _llamar(String telefono) async {
    final uri = Uri(scheme: 'tel', path: telefono);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('No se pudo abrir tel:$telefono')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Información de emergencia'),
        backgroundColor: const Color(0xFFD62828),
        foregroundColor: Colors.white,
      ),
      body: _cargando
        ? const Center(child: CircularProgressIndicator())
        : _error != null
          ? Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.error_outline, size: 64, color: Colors.grey),
                    const SizedBox(height: 12),
                    Text(_error!, textAlign: TextAlign.center,
                         style: const TextStyle(fontSize: 18)),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Volver'),
                    ),
                  ],
                ),
              ),
            )
          : _construirPerfil(),
    );
  }

  Widget _construirPerfil() {
    final p = _perfil!;
    final familiares = (p['familiares'] as List?) ?? const [];
    final foto = p['foto'] as String?;
    final nombre = '${p['nombre']} ${p['apellido']}';

    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Center(
          child: CircleAvatar(
            radius: 56,
            backgroundColor: Colors.grey.shade200,
            backgroundImage: foto != null && foto.isNotEmpty ? NetworkImage(foto) : null,
            child: (foto == null || foto.isEmpty)
              ? const Icon(Icons.person, size: 64, color: Colors.grey)
              : null,
          ),
        ),
        const SizedBox(height: 12),
        Center(
          child: Text(nombre, textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
        ),
        const SizedBox(height: 24),

        if (p['grupo_sanguineo'] != null)
          _ficha(Icons.bloodtype, 'Grupo sanguíneo', p['grupo_sanguineo'] as String,
                 destacar: true),

        _ficha(Icons.warning_amber, 'Alergias', _texto(p['alergias'])),
        _ficha(Icons.medical_information, 'Enfermedades', _texto(p['enfermedades'])),
        _ficha(Icons.medication, 'Medicamentos', _texto(p['medicamentos'])),

        const SizedBox(height: 16),
        const Text('Contactos de emergencia',
                   style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        if (familiares.isEmpty)
          const Text('Sin contactos registrados.',
                     style: TextStyle(color: Colors.grey))
        else
          ...familiares.map((f) {
            final m = f as Map<String, dynamic>;
            final tel = m['telefono'] as String;
            return Card(
              child: ListTile(
                leading: const Icon(Icons.person, color: Color(0xFFD62828)),
                title: Text(m['nombre'] as String,
                            style: const TextStyle(fontWeight: FontWeight.bold)),
                subtitle: Text(m['relacion'] as String),
                trailing: TextButton.icon(
                  onPressed: () => _llamar(tel),
                  icon: const Icon(Icons.phone, color: Color(0xFFD62828)),
                  label: Text(tel,
                              style: const TextStyle(color: Color(0xFFD62828))),
                ),
              ),
            );
          }),
      ],
    );
  }

  String _texto(dynamic v) =>
      (v == null || (v is String && v.trim().isEmpty)) ? '—' : v.toString();

  Widget _ficha(IconData icon, String label, String valor, {bool destacar = false}) {
    return Card(
      color: destacar ? const Color(0xFFFFF3F0) : null,
      child: ListTile(
        leading: Icon(icon, color: const Color(0xFFD62828),
                      size: destacar ? 32 : 24),
        title: Text(label,
                    style: TextStyle(fontSize: 12, color: Colors.grey.shade700)),
        subtitle: Text(valor,
            style: TextStyle(
              fontSize: destacar ? 22 : 16,
              color: Colors.black87,
              fontWeight: destacar ? FontWeight.bold : FontWeight.normal,
            )),
      ),
    );
  }
}
