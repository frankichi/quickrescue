class AppConfig {
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://quickrescue-api.onrender.com/api/v1',
  );

  /// Base del panel web público. Se usa para construir las URLs codificadas
  /// en los QR (ej: https://quickrescue.vercel.app/qr/mascota/42).
  static const String publicWebBase = String.fromEnvironment(
    'PUBLIC_WEB_BASE',
    defaultValue: 'https://quickrescue.vercel.app',
  );

  static const Duration httpTimeout = Duration(seconds: 60);

  static String debugInfo() {
    return 'API_BASE_URL: $apiBaseUrl\n'
           'PUBLIC_WEB_BASE: $publicWebBase\n'
           'HTTP timeout: ${httpTimeout.inSeconds}s\n'
           'Version: 1.1.0';
  }
}
