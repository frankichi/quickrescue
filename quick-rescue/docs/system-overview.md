# System Overview — Quick Rescue

## Propósito

Quick Rescue es un sistema diseñado para **proteger a personas en situación
de vulnerabilidad** (adultos mayores, niños, personas con condiciones médicas
crónicas) mediante:

1. Un **perfil médico de emergencia** accesible.
2. **Geolocalización en tiempo real** desde una app móvil.
3. Un **botón SOS** que envía la ubicación actual a sus familiares por email.

## Casos de uso principales

### Caso 1: Adulto mayor con Alzheimer
- Su hija lo registra en Quick Rescue.
- Llena su perfil con sus datos médicos (alergias, medicamentos, condiciones).
- Agrega como familiares: a sí misma y al hermano.
- Le instala la app móvil al padre.
- Si el padre se desorienta y necesita ayuda, pulsa el botón SOS.
- Su hija y hermano reciben un email con la ubicación exacta y un link al mapa.

### Caso 2: Niño en la calle
- El padre lleva el celular del niño con la app instalada.
- Si lo pierde, abre el panel web y ve la última ubicación reportada.

### Caso 3: Persona con condición cardíaca
- Si sufre un evento, pulsa SOS.
- Los paramédicos que lleguen pueden consultar su perfil médico.

## Arquitectura técnica

```
┌─────────────────┐     ┌─────────────────┐
│   App Mobile    │     │  Panel Web      │
│   (Flutter)     │     │  (React + Vite) │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │     HTTPS + JWT       │
         │                       │
         └───────────┬───────────┘
                     │
                     ▼
         ┌────────────────────────┐
         │   API REST             │
         │   Node + Express + TS  │
         └───────┬────────────────┘
                 │
                 ├─────────► MySQL 8 (datos)
                 │
                 └─────────► SMTP (emails SOS)
```

## Componentes

### Backend (`/backend`)
- API REST en `/api/v1/`.
- Autenticación JWT.
- ORM Sequelize sobre MySQL.
- Envío de emails con Nodemailer.
- Ver `docs/api-spec.yaml` para el contrato completo.

### Frontend (`/frontend`)
- SPA en React + Vite.
- Pantallas: Login, Dashboard, Perfil, Familiares, Historial Médico, Ubicaciones.
- Consume la API por Axios.
- Token guardado en `localStorage` (TODO: migrar a httpOnly cookie).

### Mobile (`/mobile`)
- App Flutter con 5 pantallas: Splash, Login, Home (mapa), SOS, Profile.
- Pide permisos de ubicación al iniciar sesión.
- Usa `geolocator` para GPS y `google_maps_flutter` para el mapa.
- En SOS: obtiene posición actual + envía POST al backend que dispara los emails.

### Base de datos (`/database`)
- 4 tablas: `usuarios`, `familiares`, `historial_medico`, `ubicaciones`.
- MySQL 8 / MariaDB 10.2+.
- Charset `utf8mb4` para soportar emojis y acentos.

## Flujo de datos clave: SOS

```
Usuario pulsa SOS en mobile
   │
   ▼
mobile/screens/sos_screen.dart obtiene GPS
   │
   ▼
mobile/services/api_service.dart → POST /api/v1/sos
   │
   ▼
backend/controllers/sos.controller.ts
   │
   ▼
backend/services/sos.service.ts
   ├──► Inserta en `ubicaciones`
   ├──► Carga `familiares` del usuario
   └──► Llama a mail.service.ts → Envía email a cada familiar
```

## Decisiones de diseño

- **El usuario que se loguea ES el sujeto a rescatar.** No hay distinción
  entre "cuidador" y "protegido". Si en el futuro se necesita esa distinción,
  añadir un campo `tipo_usuario` o un nuevo modelo `Cuidador`.
- **Los familiares NO tienen cuenta.** Solo reciben emails. Si en el futuro
  se quiere darles acceso, crear flujo de invitación.
- **`historial_medico` es 1-a-1 con `usuarios`** y se crea automáticamente
  al registrar el usuario.
- **`ubicaciones` es histórico append-only.** No se editan ni borran reportes
  individualmente.
