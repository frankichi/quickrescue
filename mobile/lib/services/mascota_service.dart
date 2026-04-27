import '../models/mascota.dart';
import 'api_service.dart';

class MascotaService {
  static Future<List<Mascota>> listar() async {
    final data = await ApiService.get('/mascotas') as List<dynamic>;
    return data.map((e) => Mascota.fromJson(e as Map<String, dynamic>)).toList();
  }

  static Future<Mascota> crear(Map<String, dynamic> payload) async {
    final data = await ApiService.post('/mascotas', payload) as Map<String, dynamic>;
    return Mascota.fromJson(data);
  }

  static Future<Mascota> actualizar(int id, Map<String, dynamic> payload) async {
    final data = await ApiService.put('/mascotas/$id', payload) as Map<String, dynamic>;
    return Mascota.fromJson(data);
  }

  static Future<void> eliminar(int id) async {
    await ApiService.delete('/mascotas/$id');
  }
}
