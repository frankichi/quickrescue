import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/app_config.dart';
import 'auth_service.dart';

/// Wrapper alrededor de http.
/// Inyecta el JWT en el header Authorization automáticamente.
/// Convierte respuestas a Map. Lanza ApiException con mensaje legible.
class ApiException implements Exception {
  final String message;
  final int? statusCode;
  ApiException(this.message, [this.statusCode]);
  @override String toString() => message;
}

class ApiService {
  static Future<Map<String, String>> _headers({bool conAuth = true}) async {
    final h = {'Content-Type': 'application/json', 'Accept': 'application/json'};
    if (conAuth) {
      final token = await AuthService.getToken();
      if (token != null) h['Authorization'] = 'Bearer $token';
    }
    return h;
  }

  static Uri _uri(String path) => Uri.parse('${AppConfig.effectiveApiUrl}$path');

  static dynamic _parse(http.Response r) {
    final body = jsonDecode(r.body);
    if (r.statusCode >= 200 && r.statusCode < 300) {
      return body['data'];
    }
    final msg = body is Map && body['error'] != null
        ? body['error'] as String
        : 'Error HTTP ${r.statusCode}';
    throw ApiException(msg, r.statusCode);
  }

  static Future<dynamic> get(String path, {bool conAuth = true}) async {
    final r = await http.get(_uri(path), headers: await _headers(conAuth: conAuth))
        .timeout(AppConfig.httpTimeout);
    return _parse(r);
  }

  static Future<dynamic> post(String path, Map<String, dynamic> body, {bool conAuth = true}) async {
    final r = await http.post(_uri(path),
        headers: await _headers(conAuth: conAuth),
        body: jsonEncode(body)).timeout(AppConfig.httpTimeout);
    return _parse(r);
  }

  static Future<dynamic> put(String path, Map<String, dynamic> body) async {
    final r = await http.put(_uri(path),
        headers: await _headers(), body: jsonEncode(body))
        .timeout(AppConfig.httpTimeout);
    return _parse(r);
  }
}
