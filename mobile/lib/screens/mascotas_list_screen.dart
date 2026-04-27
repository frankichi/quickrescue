import 'package:flutter/material.dart';
import '../models/mascota.dart';
import '../services/mascota_service.dart';

class MascotasListScreen extends StatefulWidget {
  const MascotasListScreen({super.key});
  @override State<MascotasListScreen> createState() => _MascotasListScreenState();
}

class _MascotasListScreenState extends State<MascotasListScreen> {
  List<Mascota> _items = const [];
  bool _cargando = true;
  String? _err;

  @override
  void initState() { super.initState(); _cargar(); }

  Future<void> _cargar() async {
    setState(() { _cargando = true; _err = null; });
    try {
      _items = await MascotaService.listar();
    } catch (e) {
      _err = e.toString().replaceFirst('Exception: ', '');
    } finally {
      if (mounted) setState(() => _cargando = false);
    }
  }

  Future<void> _eliminar(Mascota m) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('¿Eliminar mascota?'),
        content: Text('Se eliminará a ${m.nombre}.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancelar')),
          ElevatedButton(onPressed: () => Navigator.pop(ctx, true),
                         style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                         child: const Text('Eliminar')),
        ],
      ),
    );
    if (ok != true) return;
    try {
      await MascotaService.eliminar(m.id);
      _cargar();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString())),
      );
    }
  }

  IconData _iconoEspecie(String e) {
    switch (e) {
      case 'perro': return Icons.pets;
      case 'gato':  return Icons.pets;
      default:      return Icons.cruelty_free;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mis mascotas'),
        backgroundColor: const Color(0xFFD62828),
        foregroundColor: Colors.white,
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: const Color(0xFFD62828),
        onPressed: () async {
          await Navigator.pushNamed(context, '/mascota-form');
          _cargar();
        },
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: _cargando
        ? const Center(child: CircularProgressIndicator())
        : _err != null
          ? Center(child: Text(_err!, style: const TextStyle(color: Colors.red)))
          : _items.isEmpty
            ? const Center(child: Text('Aún no agregaste mascotas.'))
            : RefreshIndicator(
                onRefresh: _cargar,
                child: ListView.separated(
                  itemCount: _items.length,
                  separatorBuilder: (_, __) => const Divider(height: 1),
                  itemBuilder: (_, i) {
                    final m = _items[i];
                    return ListTile(
                      leading: CircleAvatar(
                        backgroundColor: m.perdida ? Colors.red.shade50 : null,
                        child: Icon(_iconoEspecie(m.especie),
                                    color: m.perdida ? Colors.red : null),
                      ),
                      title: Text(m.nombre, style: const TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: Text(
                        '${m.especie}${m.raza != null ? ' • ${m.raza}' : ''}'
                        '${m.perdida ? ' • 🚨 PERDIDA' : ''}',
                      ),
                      trailing: PopupMenuButton<String>(
                        onSelected: (v) async {
                          if (v == 'qr') {
                            Navigator.pushNamed(context, '/qr-view', arguments: {
                              'tipo': 'mascota', 'id': m.id, 'nombre': m.nombre,
                            });
                          } else if (v == 'editar') {
                            await Navigator.pushNamed(context, '/mascota-form', arguments: m);
                            _cargar();
                          } else if (v == 'eliminar') {
                            _eliminar(m);
                          }
                        },
                        itemBuilder: (_) => const [
                          PopupMenuItem(value: 'qr',       child: Text('Ver QR')),
                          PopupMenuItem(value: 'editar',   child: Text('Editar')),
                          PopupMenuItem(value: 'eliminar', child: Text('Eliminar')),
                        ],
                      ),
                    );
                  },
                ),
              ),
    );
  }
}
