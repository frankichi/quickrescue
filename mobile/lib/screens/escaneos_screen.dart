import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/escaneo.dart';
import '../services/escaneo_service.dart';

class EscaneosScreen extends StatefulWidget {
  const EscaneosScreen({super.key});
  @override State<EscaneosScreen> createState() => _EscaneosScreenState();
}

class _EscaneosScreenState extends State<EscaneosScreen> {
  List<Escaneo> _items = const [];
  bool _cargando = true;
  String? _err;

  @override
  void initState() { super.initState(); _cargar(); }

  Future<void> _cargar() async {
    setState(() { _cargando = true; _err = null; });
    try {
      _items = await EscaneoService.listar();
    } catch (e) {
      _err = e.toString().replaceFirst('Exception: ', '');
    } finally {
      if (mounted) setState(() => _cargando = false);
    }
  }

  Future<void> _abrirMapa(Escaneo e) async {
    final uri = Uri.parse('https://www.google.com/maps?q=${e.latitud},${e.longitud}');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  String _icono(String tipo) {
    switch (tipo) {
      case 'mascota':  return '🐾';
      case 'familiar': return '👨‍👩‍👧';
      default:         return '👤';
    }
  }

  @override
  Widget build(BuildContext context) {
    final fmt = DateFormat('dd/MM/yyyy HH:mm');
    return Scaffold(
      appBar: AppBar(
        title: const Text('Historial de escaneos'),
        backgroundColor: const Color(0xFFD62828),
        foregroundColor: Colors.white,
      ),
      body: _cargando
        ? const Center(child: CircularProgressIndicator())
        : _err != null
          ? Center(child: Text(_err!, style: const TextStyle(color: Colors.red)))
          : _items.isEmpty
            ? const Center(child: Text('Aún no hay escaneos.'))
            : RefreshIndicator(
                onRefresh: _cargar,
                child: ListView.separated(
                  itemCount: _items.length,
                  separatorBuilder: (_, __) => const Divider(height: 1),
                  itemBuilder: (_, i) {
                    final e = _items[i];
                    final tieneCoords = e.latitud != null && e.longitud != null;
                    return ListTile(
                      leading: Text(_icono(e.tipo), style: const TextStyle(fontSize: 28)),
                      title: Text(e.nombreReferencia,
                                  style: const TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: Text('${e.tipo} • ${fmt.format(e.creadoEn.toLocal())}'),
                      trailing: tieneCoords
                        ? IconButton(
                            icon: const Icon(Icons.map, color: Color(0xFFD62828)),
                            tooltip: 'Ver en mapa',
                            onPressed: () => _abrirMapa(e),
                          )
                        : const Padding(
                            padding: EdgeInsets.only(right: 8),
                            child: Icon(Icons.location_off, color: Colors.grey),
                          ),
                    );
                  },
                ),
              ),
    );
  }
}
