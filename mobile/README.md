# Quick Rescue — Mobile (Flutter)

App Android (y iOS, con un poco de setup extra) que el titular del usuario
lleva en su celular. Permite:
- Iniciar sesión y registrarse desde la propia app
- Ver mapa con su ubicación actual sobre **OpenStreetMap** (sin API key)
- Reportar ubicación automáticamente cada 5 minutos en foreground
- Pulsar el botón SOS que envía email a sus familiares con la ubicación
- Escanear un QR de otro usuario para ver su perfil público de emergencia

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

### Mapa
Quick Rescue usa **OpenStreetMap** vía `flutter_map`. **No requiere API
key ni billing.** Solo se exige cumplir la attribution (ya incluida en la
pantalla del mapa).

### Permisos
Declarados en `AndroidManifest.xml`:
- `INTERNET`
- `ACCESS_FINE_LOCATION` / `ACCESS_COARSE_LOCATION` — para el GPS
- `CAMERA` — para el lector de QR
- `CALL_PHONE` — para llamar a familiares desde el detalle del QR

Los permisos de cámara y ubicación se piden en runtime cuando el usuario
usa la funcionalidad correspondiente.

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

### Pantallas
- `splash_screen` — decide entre login/home según sesión guardada
- `login_screen` — autenticación
- `register_screen` — alta in-app del titular
- `home_screen` — mapa OSM + SOS + acceso al lector QR
- `sos_screen` — confirma y envía la alerta SOS
- `profile_screen` — datos del titular
- `qr_scanner_screen` — cámara + lector de QR
- `qr_detail_screen` — perfil público asociado al QR escaneado

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
