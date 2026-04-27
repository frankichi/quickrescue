import 'package:geolocator/geolocator.dart';
import 'api_service.dart';

/// Manejo de GPS. El reporte continuo del titular se eliminó: con el pivote
/// al concepto QR, la ubicación importante es la del transeúnte que escanea
/// (capturada por el navegador en la página pública del QR).
class LocationService {
  /// Pide permisos y obtiene posición actual con alta precisión.
  /// Lanza Exception si el usuario niega o el GPS está apagado.
  static Future<Position> obtenerPosicionActual() async {
    final gpsActivo = await Geolocator.isLocationServiceEnabled();
    if (!gpsActivo) {
      throw Exception('El GPS está desactivado. Actívalo en la configuración del sistema.');
    }
    LocationPermission perm = await Geolocator.checkPermission();
    if (perm == LocationPermission.denied) {
      perm = await Geolocator.requestPermission();
      if (perm == LocationPermission.denied) {
        throw Exception('Permiso de ubicación denegado.');
      }
    }
    if (perm == LocationPermission.deniedForever) {
      throw Exception('Permiso de ubicación denegado permanentemente. Habilítalo en ajustes.');
    }
    return Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high,
    );
  }

  /// Reporta una ubicación puntual al backend (uso opcional, no automático).
  static Future<void> reportarAlBackend(Position pos) async {
    await ApiService.post('/ubicaciones', {
      'latitud':  pos.latitude,
      'longitud': pos.longitude,
      'precision_m': pos.accuracy.round(),
    });
  }
}
