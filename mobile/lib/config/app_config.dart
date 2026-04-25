/// Constantes de configuración global.
///
/// IMPORTANTE: en CI/CD (GitHub Actions) el placeholder `DEFAULT_API_URL`
/// se reemplaza con el secret `API_BASE_URL` antes de compilar.
/// Ver `.github/workflows/build-apk.yml`.
class AppConfig {
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

  // 120s para tolerar el cold start del free tier de Render
  // (la primera petición tras 15 min de sueño puede tardar 30-90s).
  static const Duration httpTimeout = Duration(seconds: 120);
}
