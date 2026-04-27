import '../models/escaneo.dart';
import 'api_service.dart';

class EscaneoService {
  static Future<List<Escaneo>> listar({int limit = 100}) async {
    final data = await ApiService.get('/escaneos?limit=$limit') as List<dynamic>;
    return data.map((e) => Escaneo.fromJson(e as Map<String, dynamic>)).toList();
  }
}
