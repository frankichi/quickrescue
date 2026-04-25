import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../services/auth_service.dart';
import '../services/location_service.dart';
import '../models/usuario.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});
  @override State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  GoogleMapController? _mapController;
  LatLng? _miPosicion;
  Usuario? _usuario;
  String? _error;
  bool _reportando = false;

  @override
  void initState() {
    super.initState();
    _cargarUsuario();
    _obtenerYReportar();
  }

  Future<void> _cargarUsuario() async {
    final u = await AuthService.getUsuario();
    if (mounted) setState(() => _usuario = u);
  }

  Future<void> _obtenerYReportar() async {
    setState(() { _reportando = true; _error = null; });
    try {
      final pos = await LocationService.obtenerPosicionActual();
      // Reporta al backend en segundo plano (no bloquea el UI)
      LocationService.reportarAlBackend(pos).catchError((_) {});
      if (!mounted) return;
      setState(() => _miPosicion = LatLng(pos.latitude, pos.longitude));
      _mapController?.animateCamera(CameraUpdate.newLatLngZoom(_miPosicion!, 16));
    } catch (e) {
      if (mounted) setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _reportando = false);
    }
  }

  Future<void> _logout() async {
    await AuthService.logout();
    if (!mounted) return;
    Navigator.pushReplacementNamed(context, '/login');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_usuario != null
          ? 'Hola, ${_usuario!.nombre}'
          : 'Quick Rescue'),
        backgroundColor: const Color(0xFFD62828),
        foregroundColor: Colors.white,
        actions: [
          IconButton(icon: const Icon(Icons.person_outline),
            onPressed: () => Navigator.pushNamed(context, '/profile')),
          IconButton(icon: const Icon(Icons.logout), onPressed: _logout),
        ],
      ),
      body: Stack(
        children: [
          if (_miPosicion == null)
            const Center(child: CircularProgressIndicator())
          else
            GoogleMap(
              initialCameraPosition: CameraPosition(target: _miPosicion!, zoom: 16),
              myLocationEnabled: true,
              myLocationButtonEnabled: true,
              onMapCreated: (c) => _mapController = c,
              markers: {
                Marker(markerId: const MarkerId('yo'),
                  position: _miPosicion!,
                  infoWindow: const InfoWindow(title: 'Tu ubicación')),
              },
            ),
          if (_error != null)
            Positioned(
              top: 16, left: 16, right: 16,
              child: Material(
                color: Colors.red.shade100,
                borderRadius: BorderRadius.circular(8),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Row(children: [
                    const Icon(Icons.warning, color: Color(0xFFD62828)),
                    const SizedBox(width: 8),
                    Expanded(child: Text(_error!)),
                    TextButton(onPressed: _obtenerYReportar, child: const Text('Reintentar')),
                  ]),
                ),
              ),
            ),
          Positioned(
            bottom: 24, left: 16, right: 16,
            child: ElevatedButton.icon(
              icon: _reportando
                ? const SizedBox(width: 18, height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                : const Icon(Icons.warning_amber_rounded, size: 28),
              label: const Text('  ACTIVAR SOS  ',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFD62828),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 18),
              ),
              onPressed: _reportando
                ? null
                : () => Navigator.pushNamed(context, '/sos'),
            ),
          ),
        ],
      ),
    );
  }
}
