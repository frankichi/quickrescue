import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../services/familiar_service.dart';
import '../services/mascota_service.dart';
import '../services/escaneo_service.dart';
import '../models/usuario.dart';
import '../models/escaneo.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});
  @override State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  Usuario? _usuario;
  int? _countFamiliares;
  int? _countMascotas;
  List<Escaneo> _escaneosRecientes = const [];
  bool _cargando = true;

  @override
  void initState() {
    super.initState();
    _cargar();
  }

  Future<void> _cargar() async {
    setState(() => _cargando = true);
    try {
      final u = await AuthService.getUsuario();
      // Carga en paralelo
      final results = await Future.wait([
        FamiliarService.listar(),
        MascotaService.listar(),
        EscaneoService.listar(limit: 3),
      ]);
      if (!mounted) return;
      setState(() {
        _usuario = u;
        _countFamiliares = (results[0] as List).length;
        _countMascotas   = (results[1] as List).length;
        _escaneosRecientes = results[2] as List<Escaneo>;
      });
    } catch (_) {
      // Si algo falla, dejamos los counts en null y la card lo muestra como "—"
    } finally {
      if (mounted) setState(() => _cargando = false);
    }
  }

  Future<void> _logout() async {
    await AuthService.logout();
    if (!mounted) return;
    Navigator.pushReplacementNamed(context, '/login');
  }

  @override
  Widget build(BuildContext context) {
    final saludo = _usuario != null ? 'Hola, ${_usuario!.nombre}' : 'Quick Rescue';
    return Scaffold(
      appBar: AppBar(
        title: Text(saludo),
        backgroundColor: const Color(0xFFD62828),
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.qr_code_scanner),
            tooltip: 'Escanear QR',
            onPressed: () => Navigator.pushNamed(context, '/qr-scanner'),
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Cerrar sesión',
            onPressed: _logout,
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _cargar,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            _CardPerfil(usuario: _usuario),
            const SizedBox(height: 12),
            _CardContador(
              icono: Icons.family_restroom,
              titulo: 'Mis familiares',
              count: _countFamiliares,
              onVer: () => Navigator.pushNamed(context, '/familiares').then((_) => _cargar()),
            ),
            const SizedBox(height: 12),
            _CardContador(
              icono: Icons.pets,
              titulo: 'Mis mascotas',
              count: _countMascotas,
              onVer: () => Navigator.pushNamed(context, '/mascotas').then((_) => _cargar()),
            ),
            const SizedBox(height: 12),
            _CardEscaneos(
              cargando: _cargando,
              escaneos: _escaneosRecientes,
              onVerTodos: () => Navigator.pushNamed(context, '/escaneos'),
            ),
          ],
        ),
      ),
    );
  }
}

class _CardPerfil extends StatelessWidget {
  final Usuario? usuario;
  const _CardPerfil({required this.usuario});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: CircleAvatar(
          radius: 28,
          backgroundColor: Colors.grey.shade200,
          backgroundImage: usuario?.foto != null && usuario!.foto!.isNotEmpty
              ? NetworkImage(usuario!.foto!) : null,
          child: usuario?.foto == null || usuario!.foto!.isEmpty
              ? const Icon(Icons.person, color: Colors.grey, size: 28)
              : null,
        ),
        title: Text(
          usuario != null ? '${usuario!.nombre} ${usuario!.apellido}' : '...',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Text(usuario?.email ?? ''),
        trailing: const Icon(Icons.chevron_right),
        onTap: () => Navigator.pushNamed(context, '/profile'),
      ),
    );
  }
}

class _CardContador extends StatelessWidget {
  final IconData icono;
  final String titulo;
  final int? count;
  final VoidCallback onVer;
  const _CardContador({
    required this.icono, required this.titulo,
    required this.count, required this.onVer,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: Icon(icono, color: const Color(0xFFD62828), size: 32),
        title: Text(titulo, style: const TextStyle(fontSize: 16)),
        subtitle: Text(
          count == null ? '—' : '$count registrado${count == 1 ? '' : 's'}',
        ),
        trailing: TextButton(onPressed: onVer, child: const Text('Ver')),
        onTap: onVer,
      ),
    );
  }
}

class _CardEscaneos extends StatelessWidget {
  final bool cargando;
  final List<Escaneo> escaneos;
  final VoidCallback onVerTodos;
  const _CardEscaneos({
    required this.cargando, required this.escaneos, required this.onVerTodos,
  });

  String _hace(DateTime d) {
    final delta = DateTime.now().difference(d);
    if (delta.inMinutes < 60) return 'hace ${delta.inMinutes} min';
    if (delta.inHours   < 24) return 'hace ${delta.inHours} h';
    return 'hace ${delta.inDays} días';
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Column(
        children: [
          ListTile(
            leading: const Icon(Icons.podcasts, color: Color(0xFFD62828), size: 32),
            title: const Text('Últimos escaneos',
                              style: TextStyle(fontWeight: FontWeight.bold)),
            trailing: TextButton(onPressed: onVerTodos, child: const Text('Ver todos')),
          ),
          if (cargando)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 16),
              child: SizedBox(width: 20, height: 20,
                child: CircularProgressIndicator(strokeWidth: 2)),
            )
          else if (escaneos.isEmpty)
            const Padding(
              padding: EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: Text('Aún no hay escaneos.',
                          style: TextStyle(color: Colors.grey)),
            )
          else
            ...escaneos.map((e) => ListTile(
              dense: true,
              title: Text(e.nombreReferencia),
              subtitle: Text('${e.tipo} • ${_hace(e.creadoEn)}'),
              trailing: e.latitud != null
                  ? const Icon(Icons.location_on, color: Colors.green)
                  : const Icon(Icons.location_off, color: Colors.grey),
            )),
        ],
      ),
    );
  }
}
