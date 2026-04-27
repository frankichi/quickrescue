class AppConfig {
  // dart-define se inyecta en compile time. Si no se pasa, usa el default.
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://quickrescue-api.onrender.com/api/v1',
  );

  // Ya no usamos placeholder con sed. El default es directamente la URL real.
  static String get effectiveApiUrl => apiBaseUrl;

  static const Duration httpTimeout = Duration(seconds: 60);

  static String debugInfo() {
    return 'apiBaseUrl: $apiBaseUrl\n'
           'Compiled: ${const String.fromEnvironment("API_BASE_URL", defaultValue: "USING_DEFAULT")}';
  }
}
