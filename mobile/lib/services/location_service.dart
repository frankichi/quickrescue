import 'package:geolocator/geolocator.dart';
import 'api_service.dart';

/// Manejo de GPS y reporte de ubicación al backend.
class LocationService {
  /// Pide permisos y obtiene posición actual con alta precisión.
  /// Lanza Exception si el usuario niega o el GPS está apagado.
  static Future<Position> obtenerPosicionActual() async {
    bool gpsActivo = await Geolocator.isLocationServiceEnabled();
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

  /// Reporta la ubicación actual al backend (sin SOS).
  static Future<void> reportarAlBackend(Position pos) async {
    await ApiService.post('/ubicaciones', {
      'latitud':  pos.latitude,
      'longitud': pos.longitude,
      'precision_m': pos.accuracy.round(),
    });
  }

  /// Dispara SOS: envía POST /sos con la ubicación y dispara emails.
  static Future<Map<String, dynamic>> dispararSOS(Position pos, {String? mensaje}) async {
    final data = await ApiService.post('/sos', {
      'latitud':  pos.latitude,
      'longitud': pos.longitude,
      if (mensaje != null && mensaje.isNotEmpty) 'mensaje': mensaje,
    }) as Map<String, dynamic>;
    return data;
  }
}
