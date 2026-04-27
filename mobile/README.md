# Quick Rescue — Mobile (Flutter)

App Android (y iOS, con un poco de setup extra) que el TITULAR (afiliado)
usa para gestionar a sus seres queridos protegidos por Quick Rescue.

## ¿Qué hace la app del titular?
- Iniciar sesión y registrarse desde la propia app
- Dashboard con resumen: perfil, conteo de familiares y mascotas, últimos escaneos
- CRUD de **familiares** (contactos protegidos): nombre, teléfono, relación
- CRUD de **mascotas**: nombre, especie, raza, microchip, marcado de "perdida"
- Generar el **QR físico** para cada familiar/mascota (compartible por WhatsApp/email)
- Ver el **historial de escaneos** que han hecho terceros sobre los QR del titular
- Lector de QR opcional (si el titular ve a alguien con un QR Quick Rescue)

> El concepto del producto: el TITULAR registra a sus seres queridos y
> reparte/coloca los QR físicos. Cuando un transeúnte se encuentra a
> alguien perdido y escanea el QR con la **cámara nativa** de su celular,
> la página pública del QR se abre con datos para contactar al titular,
> y este recibe un email automático del escaneo.

## Setup local

```bash
flutter pub get
flutter run                    # emulador / dispositivo conectado
flutter build apk --release    # APK release en build/app/outputs/flutter-apk/
```

## Configuración

El backend y la URL pública se inyectan en compile time vía `--dart-define`:

```bash
flutter build apk --release \
  --dart-define=API_BASE_URL=https://quickrescue-api.onrender.com/api/v1 \
  --dart-define=PUBLIC_WEB_BASE=https://quickrescue.vercel.app
```

En CI/CD esto lo hace `.github/workflows/build-apk.yml` con los secrets
correspondientes. Defaults seguros viven en `lib/config/app_config.dart`.

### Mapa
Quick Rescue usa **OpenStreetMap** (`flutter_map`). Sin API key.

### Permisos
Declarados en `AndroidManifest.xml`:
- `INTERNET`, `ACCESS_NETWORK_STATE`
- `ACCESS_FINE_LOCATION` / `ACCESS_COARSE_LOCATION` — para los pocos casos
  en que el titular reporta una ubicación manualmente
- `CAMERA` — para el lector de QR opcional
- `CALL_PHONE` — para llamar a familiares desde el detalle del QR

## Estructura

```
lib/
├── main.dart                  Entry + rutas
├── config/app_config.dart     URL backend, URL pública, timeout
├── models/                    Familiar, Mascota, Escaneo, Usuario
├── services/                  http, auth, familiar, mascota, escaneo, location
└── screens/                   Splash, Login, Register, Home (dashboard),
                                Profile, FamiliaresList/Form, MascotasList/Form,
                                QrView (titular), QrScanner, QrDetail (público),
                                Escaneos, Diagnostic
```

## Distribución del APK

```bash
git tag v1.X.0
git push origin v1.X.0
```
URL "latest":
```
https://github.com/<usuario>/quickrescue/releases/latest/download/quick-rescue.apk
```
