import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:geolocator/geolocator.dart';
import '../services/auth_service.dart';
import '../services/location_service.dart';
import '../models/usuario.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});
  @override State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  static const Duration _intervaloReporte = Duration(minutes: 5);

  final MapController _mapController = MapController();
  LatLng? _miPosicion;
  Usuario? _usuario;
  String? _error;
  bool _reportando = false;
  Timer? _timerReporte;

  @override
  void initState() {
    super.initState();
    _cargarUsuario();
    _obtenerYReportar();
    _arrancarReportePeriodico();
  }

  @override
  void dispose() {
    _timerReporte?.cancel();
    super.dispose();
  }

  Future<void> _cargarUsuario() async {
    final u = await AuthService.getUsuario();
    if (mounted) setState(() => _usuario = u);
  }

  Future<void> _obtenerYReportar() async {
    setState(() { _reportando = true; _error = null; });
    try {
      final pos = await LocationService.obtenerPosicionActual();
      LocationService.reportarAlBackend(pos).catchError((_) {});
      if (!mounted) return;
      final nueva = LatLng(pos.latitude, pos.longitude);
      setState(() => _miPosicion = nueva);
      _mapController.move(nueva, 16);
    } catch (e) {
      if (mounted) setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _reportando = false);
    }
  }

  /// Cada 5 min: obtiene la posición silenciosamente y la reporta.
  /// No actualiza la UI ni muestra errores (es background passivo en foreground).
  void _arrancarReportePeriodico() {
    _timerReporte = Timer.periodic(_intervaloReporte, (_) async {
      try {
        final pos = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.high,
        );
        await LocationService.reportarAlBackend(pos);
      } catch (_) {
        // Silencioso: si falla un tick, lo intentará en el siguiente.
      }
    });
  }

  Future<void> _logout() async {
    _timerReporte?.cancel();
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
            FlutterMap(
              mapController: _mapController,
              options: MapOptions(
                initialCenter: _miPosicion!,
                initialZoom: 16,
                minZoom: 3,
                maxZoom: 19,
              ),
              children: [
                TileLayer(
                  urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                  userAgentPackageName: 'com.quickrescue.app',
                  // OSM exige attribution; lo agregamos abajo.
                ),
                MarkerLayer(
                  markers: [
                    Marker(
                      point: _miPosicion!,
                      width: 48, height: 48,
                      child: const Icon(Icons.location_on,
                                        size: 48, color: Color(0xFFD62828)),
                    ),
                  ],
                ),
                const RichAttributionWidget(
                  attributions: [
                    TextSourceAttribution('OpenStreetMap contributors'),
                  ],
                ),
              ],
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

          // Botón QR en esquina superior derecha
          Positioned(
            top: 16, right: 16,
            child: FloatingActionButton(
              heroTag: 'qr',
              backgroundColor: Colors.white,
              foregroundColor: const Color(0xFFD62828),
              tooltip: 'Escanear QR',
              onPressed: () => Navigator.pushNamed(context, '/qr-scanner'),
              child: const Icon(Icons.qr_code_scanner, size: 28),
            ),
          ),

          // SOS abajo
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
