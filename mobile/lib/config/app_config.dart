class AppConfig {
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://quickrescue-api.onrender.com/api/v1',
  );

  // Eliminado effectiveApiUrl. Todo el código debe usar apiBaseUrl directamente.

  static const Duration httpTimeout = Duration(seconds: 60);

  static String debugInfo() {
    return 'API_BASE_URL: $apiBaseUrl\n'
           'HTTP timeout: ${httpTimeout.inSeconds}s\n'
           'Version: 1.0.4';
  }
}
