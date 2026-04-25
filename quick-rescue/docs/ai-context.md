# AI Context — Quick Rescue

> **Lectura obligatoria para cualquier agente IA (Antigravity, Claude Code,
> Cursor) que continúe este proyecto.**

## ¿Qué es Quick Rescue?

Sistema de identificación y rescate por geolocalización para personas en
situación de vulnerabilidad. Tres componentes:

1. **App móvil (Flutter)** — la lleva el usuario titular. Permite pulsar SOS,
   ver el mapa y reportar ubicación.
2. **Panel web (React)** — donde el usuario configura su perfil, agrega
   familiares y revisa el histórico de ubicaciones.
3. **API REST (Node + Express + TS)** — backend único que sirve a ambas.

## Estado actual del scaffolding (✅ COMPLETO Y FUNCIONAL)

### Documentación
- [x] `README.md`, `AGENTS.md`, `ROADMAP.md` raíz
- [x] `docs/system-overview.md`
- [x] `docs/api-spec.yaml` (OpenAPI 3.0 con todos los endpoints)
- [x] `docs/database-schema.sql` + `database/schema.{mysql,postgres}.sql`
- [x] `docs/features.md`, `docs/flows.md`, `docs/roadmap.md`
- [x] `docs/deployment.md` (guía de despliegue gratuito en Render+Vercel+GitHub)
- [x] `docs/ai-context.md` (este archivo)

### Base de datos
- [x] Esquema MySQL y PostgreSQL listos para correr
- [x] `seed.sql` con datos demo en ambos dialects
- [x] 4 tablas: `usuarios`, `familiares`, `historial_medico`, `ubicaciones`
- [x] FKs con `ON DELETE CASCADE`

### Backend (Node + Express + TS + Sequelize)
- [x] `package.json` con TODAS las dependencias correctas
- [x] `tsconfig.json`
- [x] `.env.example` documentado
- [x] `src/main.ts` y `src/app.ts`
- [x] `src/config/{env,database,mailer}.ts`
  - **Auto-detección MySQL vs PostgreSQL desde `DATABASE_URL`**
  - **Resend integrado** para emails (no SMTP)
- [x] `src/utils/{logger,jwt,password,AppError}.ts`
- [x] `src/middleware/{auth,error,validation}.middleware.ts`
- [x] `src/models/` — 4 modelos Sequelize + `index.ts` con asociaciones
- [x] `src/services/` — auth, usuario, familiar, historial, ubicacion, sos
- [x] `src/controllers/` — 6 controllers
- [x] `src/routes/` — 6 routers + index
- [x] `src/validators/` — express-validator chains

### Frontend (React 18 + Vite + TS)
- [x] `package.json` + `tsconfig.json` + `vite.config.ts`
- [x] `index.html` + `public/favicon.svg`
- [x] `src/main.tsx` + `src/App.tsx` con React Router
- [x] `src/types/index.ts` — interfaces compartidas con la API
- [x] `src/services/` — api.ts (axios + interceptor JWT) + 5 services por recurso
- [x] `src/context/AuthContext.tsx` + hook `useAuth`
- [x] `src/components/{ProtectedRoute,Layout}.tsx`
- [x] **7 páginas funcionales**: Login, Register, Dashboard, Profile,
      Familiares (CRUD completo), HistorialMedico, Ubicaciones
- [x] `src/styles/global.css` (sin framework CSS, ~300 líneas)
- [x] `vercel.json` para despliegue

### Mobile (Flutter)
- [x] `pubspec.yaml` con dependencias (http, geolocator, google_maps_flutter,
      shared_preferences, url_launcher)
- [x] `lib/main.dart` con MaterialApp y rutas nombradas
- [x] `lib/config/app_config.dart` (URL inyectable desde CI)
- [x] `lib/models/{usuario,familiar}.dart`
- [x] `lib/services/{api_service,auth_service,location_service}.dart`
- [x] **5 pantallas**: Splash, Login, Home (con Google Map), SOS, Profile
- [x] `android/app/src/main/AndroidManifest.xml` con permisos y Maps key

### Infraestructura
- [x] `render.yaml` — Infrastructure-as-Code (un click para Render)
- [x] `frontend/vercel.json` — config Vercel
- [x] `.github/workflows/build-apk.yml` — compila APK en cada git tag
      y lo publica en GitHub Releases
- [x] `.gitignore` general

## 🚧 Tareas pendientes (TODO para Antigravity)

Marcadas en orden de prioridad. **El scaffolding actual es funcional**;
estas son mejoras y features adicionales.

### Alta prioridad
1. **Subida de fotos**: el campo `usuario.foto` y `mascota.foto` aceptan URL.
   Añadir endpoint `POST /api/v1/usuarios/me/foto` con `multer`. Guardar en
   Cloudflare R2 / Supabase Storage (free tier).
2. **Refresh tokens**: hoy solo `access_token` (15 min). Añadir tabla
   `sesiones`, endpoint `POST /auth/refresh`, rotación.
3. **Background location en mobile**: hoy solo se reporta cuando la app
   está abierta. Usar `flutter_background_service` o `workmanager`.
4. **Tests**: Jest + Supertest en backend. Cobertura mínima en `auth` y `sos`.
5. **Mapa con histórico en frontend**: la página `Ubicaciones.tsx` muestra
   solo tabla. Añadir mapa con Leaflet (gratis, sin API key) o Google Maps.

### Media prioridad
6. **Notificaciones push (FCM)** para que el familiar reciba aviso
   instantáneo además del email.
7. **Pantalla de registro en mobile**. Hoy solo permite login (tiene un
   TODO comentado en `login_screen.dart`).
8. **Rate limiting** con `express-rate-limit` en `/auth/*` y `/sos`.
9. **Validación de formularios en frontend** con `react-hook-form` + `zod`.

### Baja prioridad
10. **Generación de QR físico** del usuario (con su `id` o un token público
    nuevo) para identificación en pulsera/llavero.
11. **Vista pública (sin login)** que se abre al escanear el QR.
12. **Modo offline en mobile** con cola de ubicaciones a sincronizar.
13. **i18n** backend + frontend + mobile.
14. **Panel admin** con métricas.

## Decisiones tomadas (no cambiar sin discusión)

- **Sequelize** y no Prisma: el agente puede editar modelos sin re-generar.
- **Auto-detección de dialect** en `database.ts`: el código funciona con
  MySQL local Y PostgreSQL en Render sin tocar nada. Solo cambia
  `DATABASE_URL`.
- **Resend** y no SMTP: API más simple, free tier 100/día sin tarjeta.
- **JWT con access corto + plan de refresh**: balance seguridad/UX.
- **Flutter** y no React Native: una sola tecnología (Dart) más fácil de
  mantener para un equipo pequeño y mejor performance gráfica para mapas.
- **Stack 100% gratis** documentado en `docs/deployment.md`:
  Render + Vercel + GitHub Actions + Resend.
- **Nombres en español** en modelos, servicios y UI: el dominio del
  problema es local (Perú).

## Cómo continuar

1. **Lee `AGENTS.md`** para conocer las convenciones obligatorias.
2. **Lee `docs/api-spec.yaml`** para entender el contrato.
3. **Lee `docs/deployment.md`** si vas a tocar configuración de despliegue.
4. Elige una tarea de "Pendientes" (empieza por las de alta prioridad).
5. Antes de codear, **actualiza `docs/api-spec.yaml`** si vas a cambiar
   el contrato HTTP.
6. Después de codear, **actualiza esta sección "Estado actual"** marcando
   lo que completaste con [x].

## Convenciones del agente

- `TODO`: alguien (humano o IA) ya pensó qué falta. Resuélvelo o muévelo
  a este archivo.
- `FIXME`: bug conocido. Tiene prioridad sobre features nuevas.
- `// HACK`: código que funciona pero no es la solución correcta.
