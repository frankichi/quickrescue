# AI Context — Quick Rescue

> **Lectura obligatoria para cualquier agente IA (Antigravity, Claude Code,
> Cursor) que continúe este proyecto.**

## ¿Qué es Quick Rescue?

Sistema de identificación por **QR físico** para personas vulnerables y
mascotas. Tres componentes:

1. **App móvil del titular (Flutter)** — el cuidador la usa para gestionar
   familiares, mascotas y QRs. Dashboard con conteos y últimos escaneos.
2. **Panel web del titular (React)** — mismas funciones, además de
   imprimir/descargar los QR generados.
3. **Página pública del QR (React, parte del frontend)** — la abre el
   transeúnte que escanea el QR físico desde su cámara nativa.
4. **API REST (Node + Express + TS)** — backend único.

> ⚠️ **Pivote v1.1.0** (2026-04-26): el SOS desapareció. La nueva propuesta
> de valor es el QR físico que cualquiera puede escanear sin instalar nada.

## Estado actual (✅ funcional, post-pivote v1.1.0)

### Documentación
- [x] `README.md`, `AGENTS.md`, `ROADMAP.md` raíz
- [x] `docs/system-overview.md` (actualizado con concepto QR)
- [x] `docs/api-spec.yaml` (incluye `/qr/...` y `/escaneos`)
- [x] `database/schema.{mysql,postgres}.sql` + `database/migration_002_escaneos.sql`
- [x] `docs/features.md`, `docs/flows.md`, `docs/roadmap.md` (pendientes de actualizar al pivote)
- [x] `docs/deployment.md`
- [x] `docs/ai-context.md` (este archivo)

### Base de datos
- [x] **6 tablas**: `usuarios`, `familiares`, `mascotas`, `historial_medico`,
      `ubicaciones`, `escaneos_qr`
- [x] FKs con `ON DELETE CASCADE`
- [x] Migración 002 disponible en `database/migration_002_escaneos.sql`

### Backend
- [x] Modelos: Usuario, Familiar, Mascota, HistorialMedico, Ubicacion, Escaneo
- [x] Services: auth, usuario, familiar, mascota, historial, ubicacion, **qr**, **escaneos**
- [x] Routes: `/qr/...` (público), `/escaneos` (autenticado), todo lo demás privado
- [x] Email automático al titular cuando alguien escanea
- [ ] ~~SOS~~ ELIMINADO en v1.1.0

### Frontend
- [x] Página **pública** `/qr/:tipo/:id` (PublicQR.tsx) sin sidebar, mobile-first
- [x] Componente `QRModal` que renderiza/imprime/descarga QR (`qrcode` npm)
- [x] Botón "Ver QR" en filas de Familiares.tsx y Mascotas.tsx
- [x] Página `Escaneos.tsx` con histórico
- [x] Sidebar actualizado con link "📡 Historial de escaneos"

### Mobile
- [x] Dashboard (home_screen): cards Perfil, Familiares, Mascotas, Últimos escaneos
- [x] CRUD completo de Familiares y Mascotas (list + form)
- [x] Pantalla `qr_view_screen` con QR renderizado (`qr_flutter`) + share (`share_plus`)
- [x] Pantalla `escaneos_screen` con historial + link a Maps externo
- [x] Inyección por `--dart-define`: `API_BASE_URL` y `PUBLIC_WEB_BASE`
- [ ] ~~SOS screen~~ ELIMINADA
- [ ] ~~Reporte automático de ubicación cada 5 min~~ ELIMINADO

## Decisiones tomadas (no cambiar sin discusión)

- **Pivote v1.1.0 (2026-04-26)** — eliminado SOS, dashboard del titular,
  QR físico como mecanismo principal. Ver `docs/system-overview.md`.
- **Sequelize** y no Prisma.
- **Auto-detección MySQL/PostgreSQL** en `database.ts`.
- **Resend** para emails (no SMTP).
- **JWT** access corto + plan refresh.
- **Flutter** y no React Native.
- **OpenStreetMap** (`flutter_map` + Leaflet) — sin API key ni billing.
- **Stack 100% gratis**: Render + Vercel + GitHub Actions + Resend.
- **Nombres en español** en modelos, servicios, UI.
- **`String.fromEnvironment` + `--dart-define`** para inyectar URLs en
  el APK (NO sed sobre el .dart).

## 🚧 Pendientes próximos

### Alta prioridad
1. **Rediseño visual completo** del frontend (v1.2.0) — alineado al
   nuevo concepto QR.
2. **Subida de fotos** (Cloudflare R2 / Supabase Storage) — hoy se
   guarda solo URL.
3. **Refresh tokens** — hoy solo access (15 min).
4. **Tests** Jest + Supertest, especialmente en `qr.service` y `escaneos`.
5. **Página `/historial` mobile** (link removido temporalmente del dashboard).

### Media prioridad
6. **Push FCM** además de email.
7. **Rate limit** en `/qr/...` para prevenir abuso de notificaciones.
8. **Validación de formularios frontend** con `react-hook-form` + `zod`.
9. **Vista pública mascota perdida** con highlight especial.

### Baja prioridad
10. **i18n**.
11. **Modo offline mobile** con cola de cambios.
12. **Panel admin** con métricas globales de escaneos.

## Cómo continuar

1. Lee `AGENTS.md` para convenciones.
2. Lee `docs/system-overview.md` para entender el concepto QR.
3. Lee `docs/api-spec.yaml` para el contrato HTTP.
4. Toca una tarea de "Pendientes próximos" (alta primero).
5. Si cambias el contrato HTTP, **actualiza `docs/api-spec.yaml` en el mismo PR**.
6. Después de codear, **actualiza esta sección "Estado actual"**.

## Convenciones del agente

- `TODO`: alguien (humano o IA) ya pensó qué falta. Resuélvelo o muévelo
  a este archivo.
- `FIXME`: bug conocido. Tiene prioridad sobre features nuevas.
- `// HACK`: código que funciona pero no es la solución correcta.
