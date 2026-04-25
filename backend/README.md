# Quick Rescue — Backend

API REST en Node.js + Express + TypeScript + Sequelize.

## Desarrollo local

```bash
cp .env.example .env       # Ajusta DATABASE_URL y JWT_SECRET
npm install
npm run dev                 # http://localhost:3000
```

## Build de producción

```bash
npm run build
npm start
```

## Estructura
```
src/
├── main.ts                 Entry point (arranca el server)
├── app.ts                  Configura la app Express (sin arrancar)
├── config/                 env, database, mailer
├── controllers/            Reciben req/res, delegan a services
├── services/               Lógica de negocio
├── routes/                 Definición de endpoints
├── models/                 Modelos Sequelize
├── middleware/             auth, error, validation
├── utils/                  jwt, password, logger, AppError
└── validators/             Reglas express-validator
```

## Endpoints

Ver `docs/api-spec.yaml` en la raíz del repo (OpenAPI 3.0).

## Notas

- **Ambos dialects soportados**: el campo `DATABASE_URL` decide. Si empieza
  con `mysql://` usa MySQL, si empieza con `postgres://` usa PostgreSQL.
- **Emails**: si `RESEND_API_KEY` no está definido, los emails se loguean
  en consola (modo desarrollo).
- **JWT**: solo access token por ahora. Refresh tokens están en el roadmap.
