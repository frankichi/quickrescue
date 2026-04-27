import 'package:flutter/material.dart';
import '../models/familiar.dart';
import '../services/familiar_service.dart';

class FamiliaresListScreen extends StatefulWidget {
  const FamiliaresListScreen({super.key});
  @override State<FamiliaresListScreen> createState() => _FamiliaresListScreenState();
}

class _FamiliaresListScreenState extends State<FamiliaresListScreen> {
  List<Familiar> _items = const [];
  bool _cargando = true;
  String? _err;

  @override
  void initState() { super.initState(); _cargar(); }

  Future<void> _cargar() async {
    setState(() { _cargando = true; _err = null; });
    try {
      _items = await FamiliarService.listar();
    } catch (e) {
      _err = e.toString().replaceFirst('Exception: ', '');
    } finally {
      if (mounted) setState(() => _cargando = false);
    }
  }

  Future<void> _eliminar(Familiar f) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('¿Eliminar familiar?'),
        content: Text('Se eliminará a ${f.nombre}.'),
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
      await FamiliarService.eliminar(f.id);
      _cargar();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString())),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mis familiares'),
        backgroundColor: const Color(0xFFD62828),
        foregroundColor: Colors.white,
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: const Color(0xFFD62828),
        onPressed: () async {
          await Navigator.pushNamed(context, '/familiar-form');
          _cargar();
        },
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: _cargando
        ? const Center(child: CircularProgressIndicator())
        : _err != null
          ? Center(child: Text(_err!, style: const TextStyle(color: Colors.red)))
          : _items.isEmpty
            ? const Center(child: Text('Aún no agregaste familiares.'))
            : RefreshIndicator(
                onRefresh: _cargar,
                child: ListView.separated(
                  itemCount: _items.length,
                  separatorBuilder: (_, __) => const Divider(height: 1),
                  itemBuilder: (_, i) {
                    final f = _items[i];
                    return ListTile(
                      leading: const CircleAvatar(child: Icon(Icons.person)),
                      title: Text(f.nombre, style: const TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: Text('${f.relacion} • ${f.telefono}'),
                      trailing: PopupMenuButton<String>(
                        onSelected: (v) async {
                          if (v == 'qr') {
                            Navigator.pushNamed(context, '/qr-view', arguments: {
                              'tipo': 'familiar', 'id': f.id, 'nombre': f.nombre,
                            });
                          } else if (v == 'editar') {
                            await Navigator.pushNamed(context, '/familiar-form', arguments: f);
                            _cargar();
                          } else if (v == 'eliminar') {
                            _eliminar(f);
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
