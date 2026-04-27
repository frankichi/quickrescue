import '../models/familiar.dart';
import 'api_service.dart';

class FamiliarService {
  static Future<List<Familiar>> listar() async {
    final data = await ApiService.get('/familiares') as List<dynamic>;
    return data.map((e) => Familiar.fromJson(e as Map<String, dynamic>)).toList();
  }

  static Future<Familiar> crear(Map<String, dynamic> payload) async {
    final data = await ApiService.post('/familiares', payload) as Map<String, dynamic>;
    return Familiar.fromJson(data);
  }

  static Future<Familiar> actualizar(int id, Map<String, dynamic> payload) async {
    final data = await ApiService.put('/familiares/$id', payload) as Map<String, dynamic>;
    return Familiar.fromJson(data);
  }

  static Future<void> eliminar(int id) async {
    await ApiService.delete('/familiares/$id');
  }
}
