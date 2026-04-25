# Quick Rescue 🚨

Sistema de identificación y rescate por geolocalización para personas en
situación de vulnerabilidad. Perfil médico accesible mediante código QR +
botón SOS que comparte ubicación en tiempo real con familiares por email.

## 🆓 Despliegue 100 % gratis (sin tarjeta)

```
┌──────────────────┐   ┌────────────┐   ┌──────────────────┐
│ Frontend (React) │   │ API (Node) │   │ Base de datos    │
│ → Vercel         │←─→│ → Render   │←─→│ → Render Postgres│
└──────────────────┘   └────────────┘   └──────────────────┘
                              ↑
                              │ build automático
                       ┌──────┴──────┐
                       │   GitHub    │  ← APK Android publicado
                       │   Actions   │     en GitHub Releases
                       └─────────────┘
```

**Costo total: $0/mes**. Lee la guía paso a paso en
[`docs/deployment.md`](docs/deployment.md).

## 🏗️ Arquitectura

Monorepo con tres aplicaciones independientes:

```
quick-rescue/
├── backend/      Node 20 + Express + TypeScript + Sequelize (MySQL/PostgreSQL)
├── frontend/     React 18 + Vite + TypeScript (panel web)
├── mobile/       Flutter 3.x (app con mapa + GPS + SOS)
├── database/     Scripts SQL (versión MySQL y PostgreSQL)
├── docs/         Especificación, OpenAPI, deployment, contexto IA
└── .github/      GitHub Actions (build APK automático)
```

## 🚀 Inicio rápido (desarrollo local)

### Opción A: Con MySQL local
```bash
# 1. Base de datos
mysql -u root -p < database/schema.mysql.sql
mysql -u root -p < database/seed.mysql.sql      # opcional

# 2. Backend
cd backend
cp .env.example .env
# en .env, deja: DATABASE_URL=mysql://root:@localhost:3306/quickrescue
npm install
npm run dev                                      # http://localhost:3000
```

### Opción B: Con PostgreSQL local
```bash
# 1. Base de datos
psql -U postgres -c "CREATE DATABASE quickrescue;"
psql -U postgres -d quickrescue -f database/schema.postgres.sql

# 2. Backend
cd backend
cp .env.example .env
# en .env, ajusta: DATABASE_URL=postgres://postgres:postgres@localhost:5432/quickrescue
npm install
npm run dev
```

El backend **detecta el dialect automáticamente** del prefijo de `DATABASE_URL`,
así que el mismo código funciona con ambos.

### Frontend
```bash
cd frontend
cp .env.example .env             # VITE_API_URL=http://localhost:3000/api/v1
npm install
npm run dev                       # http://localhost:5173
```

### Mobile (Flutter)
```bash
cd mobile
flutter pub get
flutter run                       # con un emulador o dispositivo conectado
```

## 📖 Documentación

- 🆓 [`docs/deployment.md`](docs/deployment.md) — **Guía de despliegue gratuito** (start here)
- [`docs/system-overview.md`](docs/system-overview.md) — Visión general
- [`docs/api-spec.yaml`](docs/api-spec.yaml) — OpenAPI 3.0 (todos los endpoints)
- [`database/schema.mysql.sql`](database/schema.mysql.sql) y [`schema.postgres.sql`](database/schema.postgres.sql) — Esquemas
- [`docs/features.md`](docs/features.md) — Funcionalidades implementadas y pendientes
- [`docs/flows.md`](docs/flows.md) — Flujos de usuario
- [`docs/ai-context.md`](docs/ai-context.md) — **Lectura obligatoria para Antigravity**
- [`docs/roadmap.md`](docs/roadmap.md) — Fases de desarrollo
- [`AGENTS.md`](AGENTS.md) — Reglas para agentes IA

## 🤖 Continuar con Antigravity

Este proyecto está estructurado para ser continuado por Antigravity. El agente
debe leer **en este orden**:

1. `AGENTS.md` — convenciones del proyecto
2. `docs/ai-context.md` — qué está hecho y qué falta
3. `docs/system-overview.md` — arquitectura
4. `docs/api-spec.yaml` — contrato de la API
5. `docs/deployment.md` — entender el target de despliegue
6. El módulo específico que va a tocar

## 🔐 Seguridad

- Contraseñas con `bcrypt` (10 rounds).
- Autenticación JWT con `access` (15 min) + `refresh` (30 días).
- Validación de entrada con `express-validator`.
- CORS configurado por origen.
- Helmet activado.
- TLS forzado en producción (Render lo provee gratis).
- Sin secretos en código: todo va por `.env` o GitHub Secrets.

## 📜 Licencia

MIT — proyecto educativo, libre de uso y modificación.
