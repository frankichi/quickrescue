# Quick Rescue — Mobile (Flutter)

App Android (y iOS, con un poco de setup extra) que el titular del usuario
lleva en su celular. Permite:
- Iniciar sesión con la misma cuenta del panel web
- Ver mapa con su ubicación actual
- Pulsar el botón SOS que envía email a sus familiares con la ubicación

## Setup local

```bash
flutter pub get

# Para ejecutar en emulador/dispositivo conectado
flutter run

# Para compilar APK release
flutter build apk --release
# Output: build/app/outputs/flutter-apk/app-release.apk
```

## Configuración

### URL del backend
Editar `lib/config/app_config.dart`:
```dart
static const String apiBaseUrl = 'https://tu-backend.onrender.com/api/v1';
```

En CI/CD (GitHub Actions) este valor se inyecta automáticamente desde el
secret `API_BASE_URL`. Ver `.github/workflows/build-apk.yml`.

### Google Maps API key (Android)
Editar `android/app/src/main/AndroidManifest.xml`, reemplazar
`YOUR_MAPS_API_KEY` con tu key real.

Sacar key en: https://console.cloud.google.com → APIs & Services → Credentials.
Habilitar: **Maps SDK for Android**.

### Permisos
Ya están declarados en `AndroidManifest.xml`:
- `INTERNET`
- `ACCESS_FINE_LOCATION`
- `ACCESS_COARSE_LOCATION`

## Estructura

```
lib/
├── main.dart                  Entry point + rutas nombradas
├── config/app_config.dart     URL del backend, otras constantes
├── models/                    Clases Dart de las entidades
├── services/                  Lógica HTTP, autenticación, GPS
├── screens/                   Una pantalla por archivo
└── widgets/                   Componentes reutilizables
```

## Distribución del APK

El APK se publica automáticamente en **GitHub Releases** al hacer push de un
tag versionado:
```bash
git tag v1.0.0
git push origin v1.0.0
```
URL pública para que tus usuarios descarguen:
```
https://github.com/<tu-usuario>/quick-rescue/releases/latest/download/quick-rescue.apk
```
