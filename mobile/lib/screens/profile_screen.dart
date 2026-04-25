import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../services/auth_service.dart';
import '../models/usuario.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});
  @override State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Usuario? _usuario;

  @override
  void initState() { super.initState(); _cargar(); }

  Future<void> _cargar() async {
    final u = await AuthService.getUsuario();
    if (mounted) setState(() => _usuario = u);
  }

  Future<void> _abrirPanelWeb() async {
    // TODO (Antigravity): cuando el panel web esté en producción real,
    // poner aquí la URL pública (env var o config).
    final uri = Uri.parse('https://quick-rescue.vercel.app/perfil');
    if (await canLaunchUrl(uri)) await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  @override
  Widget build(BuildContext context) {
    if (_usuario == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    final u = _usuario!;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mi perfil'),
        backgroundColor: const Color(0xFFD62828),
        foregroundColor: Colors.white,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          CircleAvatar(
            radius: 50,
            backgroundColor: Colors.grey.shade200,
            backgroundImage: u.foto != null ? NetworkImage(u.foto!) : null,
            child: u.foto == null
              ? const Icon(Icons.person, size: 60, color: Colors.grey)
              : null,
          ),
          const SizedBox(height: 12),
          Center(child: Text('${u.nombre} ${u.apellido}',
            style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold))),
          Center(child: Text(u.email, style: TextStyle(color: Colors.grey.shade600))),
          const SizedBox(height: 24),
          _campo(Icons.badge, 'DNI', u.dni ?? '—'),
          _campo(Icons.cake, 'Fecha de nacimiento', u.fechaNacimiento ?? '—'),
          _campo(Icons.home, 'Dirección', u.direccion ?? '—'),
          _campo(Icons.location_city, 'Distrito', u.distrito ?? '—'),
          _campo(Icons.map, 'Provincia', u.provincia ?? '—'),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            icon: const Icon(Icons.open_in_new),
            label: const Text('Editar perfil en el panel web'),
            onPressed: _abrirPanelWeb,
          ),
          const SizedBox(height: 8),
          Text(
            'La app móvil es para emergencias. Para editar tu perfil completo, '
            'usa el panel web.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
          ),
        ],
      ),
    );
  }

  Widget _campo(IconData icon, String label, String valor) => ListTile(
    leading: Icon(icon, color: const Color(0xFFD62828)),
    title: Text(label, style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
    subtitle: Text(valor, style: const TextStyle(fontSize: 16, color: Colors.black87)),
    dense: true,
  );
}
