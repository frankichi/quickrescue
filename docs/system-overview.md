# System Overview — Quick Rescue

## Propósito

Quick Rescue es un sistema para **proteger a personas vulnerables y mascotas
mediante un código QR físico** (pulsera, llavero, collar) que cualquier
transeúnte puede escanear con la cámara nativa de su celular para acceder
a la información necesaria para devolver/rescatar al portador.

## Roles

- **Titular (afiliado)**: persona que se registra y gestiona el sistema.
  Usa la app móvil y/o el panel web. Carga sus familiares vulnerables
  (adulto mayor, niño, persona con condición médica) y sus mascotas.
  Solicita los QR físicos para cada uno.
- **Transeúnte**: persona ajena al sistema que se encuentra a un familiar
  perdido o una mascota perdida del titular y escanea el QR físico con
  su cámara. NO usa la app de Quick Rescue, solo el navegador del celular.

## Casos de uso principales

### Caso 1: Adulto mayor con Alzheimer
- La hija registra al padre como "familiar" en su cuenta de Quick Rescue.
- Llena los datos médicos (alergias, medicamentos, grupo sanguíneo).
- Solicita un QR físico (pulsera) para él.
- Si el padre se desorienta y un transeúnte lo escanea, este ve cómo
  contactar a la hija inmediatamente (botón llamar). La hija recibe
  un email automático con la ubicación del escaneo.

### Caso 2: Mascota perdida
- El dueño registra a su perro Killer en Quick Rescue, con foto y
  microchip. Le pone un collar con el QR.
- Marca a Killer como "perdido" cuando se escapa.
- Quien lo encuentre escanea el collar, ve la alerta de mascota perdida
  con la foto, raza, microchip y un botón para llamar al dueño.

## Arquitectura técnica

```
┌───────────────────────┐  ┌──────────────────────┐
│  Titular: App Mobile  │  │ Titular: Panel Web   │
│       (Flutter)       │  │   (React + Vite)     │
└───────────┬───────────┘  └──────────┬───────────┘
            │  HTTPS + JWT            │
            └──────────┬──────────────┘
                       │
                       ▼
            ┌──────────────────────┐
            │   API REST           │      ┌──────────────────────┐
            │   Node + Express     │◄─────┤ Página pública       │
            │      + TypeScript    │      │  (sin auth, mobile-  │
            └─────────┬────────────┘      │  first) que abre el  │
                      │                   │  transeúnte desde la │
                      ├──► Postgres/MySQL │  cámara nativa       │
                      │                   └──────────────────────┘
                      └──► Resend (emails de notificación de escaneos)
```

## Componentes

### Backend (`/backend`)
- API REST en `/api/v1/`.
- Rutas **públicas** bajo `/api/v1/qr/...` (sin token).
- Rutas privadas con autenticación JWT.
- Sequelize sobre Postgres (Render) o MySQL (local/Aiven). Auto-detect.
- Emails con Resend.
- Ver `docs/api-spec.yaml` para el contrato completo.

### Frontend (`/frontend`)
- SPA en React + Vite.
- Pantallas **privadas**: Login, Register, Dashboard, Perfil, Familiares,
  Mascotas, Historial Médico, Ubicaciones, Historial de escaneos.
- Pantalla **pública**: `/qr/:tipo/:id` — la que abre el transeúnte al
  escanear. Mobile-first, sin sidebar, con botones gigantes para llamar.
- Componente `QRModal` para generar/imprimir/descargar el QR físico
  desde las páginas Familiares y Mascotas.
- Cliente Axios. JWT en `localStorage`.

### Mobile (`/mobile`)
- App Flutter del titular.
- Pantallas: Splash, Login, Register, Home (dashboard), Profile,
  CRUD Familiares, CRUD Mascotas, QrView (mostrar QR a imprimir/compartir),
  Historial de escaneos, QrScanner (opcional), Diagnostic.
- Renderiza QR con `qr_flutter`, comparte con `share_plus`.
- Mapa OSM (`flutter_map`) para vistas auxiliares.

### Base de datos (`/database`)
- 6 tablas: `usuarios`, `familiares`, `mascotas`, `historial_medico`,
  `ubicaciones`, `escaneos_qr`.
- Todas con `ON DELETE CASCADE` desde `usuarios`.
- Charset `utf8mb4` (MySQL).

## Flujo clave: escaneo del QR físico

```
Transeúnte ve un QR Quick Rescue
   │
   ▼
Cámara nativa del celular abre URL:
   https://quickrescue.vercel.app/qr/<tipo>/<id>
   │
   ▼
Frontend público → GET /api/v1/qr/<tipo>/<id>/publico
   │   muestra: foto + nombre + datos médicos + botón "Llamar al titular"
   │
   ├── (si el transeúnte acepta compartir ubicación)
   │       POST /api/v1/qr/<tipo>/<id>/escaneo  { latitud, longitud }
   │
   └── (si la rechaza)
           POST /api/v1/qr/<tipo>/<id>/escaneo  { latitud: null, longitud: null }
   │
   ▼
backend/services/qr.service.ts
   ├──► INSERT en `escaneos_qr`
   └──► Email automático al titular con link a Maps (si hubo coords)
```

## Decisiones de diseño

- **El usuario que se loguea es el titular cuidador**, no la persona
  vulnerable. Los protegidos van como `familiares` (sin cuenta propia).
- **Las mascotas son entidades de primera clase** con su propio QR.
- **El QR codifica una URL pública**, no un payload binario. Funciona
  con cualquier app de cámara/QR genérica.
- **El transeúnte NO instala nada.** La página pública es web responsive.
- **Coordenadas opcionales**: el transeúnte puede negar el permiso de
  geolocalización del navegador y el escaneo igual se registra.
- **Sin SMS / Twilio** todavía: solo email vía Resend (free tier).
- **`ubicaciones` se conserva** como tabla histórica para el caso del
  titular reportando manualmente, pero ya no se reporta automáticamente
  desde la app móvil cada N minutos.
- **`SOS` fue eliminado** en el pivote a v1.1.0 — no encajaba con el
  modelo de QR físico + transeúnte.
