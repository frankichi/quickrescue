/// Constantes de configuración global.
///
/// IMPORTANTE: en CI/CD (GitHub Actions) el placeholder `DEFAULT_API_URL`
/// se reemplaza con el secret `API_BASE_URL` antes de compilar.
/// Ver `.github/workflows/build-apk.yml`.
class AppConfig {
  /// Versión visible del APK (la oficial está en pubspec.yaml).
  static const String appVersion = '1.0.3';

  /// URL base del backend (incluyendo /api/v1).
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'DEFAULT_API_URL',
  );

  /// Si la URL contiene el placeholder, asumimos desarrollo local en el
  /// emulador Android (10.0.2.2 = localhost del host).
  static String get effectiveApiUrl =>
      apiBaseUrl == 'DEFAULT_API_URL'
        ? 'http://10.0.2.2:3000/api/v1'
        : apiBaseUrl;

  /// Timeout HTTP general. 60s es un balance entre tolerar el cold start
  /// del free tier de Render (~30-50s tras 15min de sueño) y no dejar al
  /// usuario esperando demasiado en una app de emergencia.
  static const Duration httpTimeout = Duration(seconds: 60);

  /// Snapshot de configuración para diagnóstico en producción.
  static String debugInfo() {
    return 'API_BASE_URL constant: $apiBaseUrl\n'
           'Effective URL: $effectiveApiUrl\n'
           'HTTP timeout: ${httpTimeout.inSeconds}s\n'
           'Version: $appVersion';
  }
}
