import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/usuario.dart';
import 'api_service.dart';

/// Manejo de sesión persistente con shared_preferences.
class AuthService {
  static const _kToken   = 'qr_token';
  static const _kUsuario = 'qr_usuario';

  static Future<String?> getToken() async {
    final p = await SharedPreferences.getInstance();
    return p.getString(_kToken);
  }

  static Future<Usuario?> getUsuario() async {
    final p = await SharedPreferences.getInstance();
    final j = p.getString(_kUsuario);
    if (j == null) return null;
    return Usuario.fromJson(jsonDecode(j) as Map<String, dynamic>);
  }

  static Future<bool> isAuthenticated() async => (await getToken()) != null;

  static Future<Usuario> login(String email, String password) async {
    final data = await ApiService.post(
      '/auth/login',
      {'email': email, 'password': password},
      conAuth: false,
    ) as Map<String, dynamic>;
    return await _persistir(data);
  }

  static Future<Usuario> registrar(Map<String, dynamic> payload) async {
    final data = await ApiService.post('/auth/register', payload, conAuth: false)
        as Map<String, dynamic>;
    return await _persistir(data);
  }

  static Future<Usuario> _persistir(Map<String, dynamic> data) async {
    final usuario = Usuario.fromJson(data['usuario'] as Map<String, dynamic>);
    final token   = data['token'] as String;
    final p = await SharedPreferences.getInstance();
    await p.setString(_kToken, token);
    await p.setString(_kUsuario, jsonEncode(usuario.toJson()));
    return usuario;
  }

  static Future<void> logout() async {
    final p = await SharedPreferences.getInstance();
    await p.remove(_kToken);
    await p.remove(_kUsuario);
  }
}
