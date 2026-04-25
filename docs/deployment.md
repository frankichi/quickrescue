# Guía de despliegue gratuito — Quick Rescue

> Esta guía explica cómo desplegar **todo el sistema en producción sin pagar
> nada**. Stack 100% gratuito en 2026, sin tarjeta de crédito requerida.

## Resumen visual

```
┌───────────────────────┐
│       GitHub          │  ← Tu código + APK liberados como Releases
└─────────┬─────────────┘
          │ push triggers auto-deploy
          ├──────────────┬──────────────┐
          ▼              ▼              ▼
      ┌──────┐       ┌────────┐     ┌─────────────┐
      │Render│       │ Vercel │     │GitHub Actions│
      │backend│      │frontend│     │  build APK  │
      └──┬───┘       └────────┘     └─────────────┘
         │
         ▼
   ┌────────────────┐
   │Render Postgres │
   └────────────────┘
```

---

## Paso 1: Subir el proyecto a GitHub

1. Crea cuenta en https://github.com (gratis).
2. Crea un repo nuevo `quick-rescue` (puede ser privado).
3. En tu máquina:
   ```bash
   cd quick-rescue
   git init
   git add .
   git commit -m "Initial scaffolding"
   git branch -M main
   git remote add origin https://github.com/<tu-usuario>/quick-rescue.git
   git push -u origin main
   ```

---

## Paso 2: Base de datos PostgreSQL en Render

1. Cuenta en https://render.com (botón "Get Started" → login con GitHub).
2. En el dashboard: **New** → **PostgreSQL**.
3. Configura:
   - **Name**: `quickrescue-db`
   - **Database**: `quickrescue`
   - **User**: `quickrescue`
   - **Region**: la más cercana a tus usuarios (Oregon o Ohio funcionan en LATAM).
   - **Plan**: **Free** (1 GB, 256 MB RAM).
4. Click **Create Database** y espera ~1 min.
5. Cuando esté lista, copia el **Internal Database URL** (lo usarás en el backend).

> ⚠️ La DB free de Render **se borra a los 90 días**. Ponte un recordatorio
> para hacer un backup mensual con `pg_dump` (la guía está al final).

### Cargar el schema
En la página de la DB hay un botón "**Connect → External Connection**". Copia
el comando `psql` y ejecútalo en tu terminal (necesitas `psql` instalado
localmente). Después:

```bash
psql "postgres://...la-url-externa..." -f database/schema.postgres.sql
psql "postgres://...la-url-externa..." -f database/seed.postgres.sql   # opcional
```

---

## Paso 3: Backend en Render

1. En Render dashboard: **New** → **Web Service**.
2. Conecta tu repo de GitHub.
3. Configura:
   - **Name**: `quickrescue-api`
   - **Region**: la **misma** que la DB.
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: **Free**
4. En **Environment Variables** añade:

   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | (pega el **Internal Database URL** del paso 2) |
   | `JWT_SECRET` | (genera con `openssl rand -hex 32`) |
   | `JWT_EXPIRES_IN` | `15m` |
   | `CORS_ORIGINS` | `https://tu-app.vercel.app` (lo defines en el paso 4) |
   | `RESEND_API_KEY` | (lo obtienes en el paso 5) |
   | `EMAIL_FROM` | `Quick Rescue <onboarding@resend.dev>` |

5. Click **Create Web Service**. El primer deploy tarda ~3-5 min.
6. Cuando termine, tu API está en `https://quickrescue-api.onrender.com`.
7. **Test rápido**: abre `https://quickrescue-api.onrender.com/api/v1/health`
   en el navegador, debe responder JSON.

> ℹ️ El servicio "duerme" tras 15 min sin tráfico. El primer request despierta
> al servicio en ~30s. Para evitar esto en producción real: paga $7/mes por
> el plan Starter, o usa un cron externo (ej. https://cron-job.org gratis)
> que pegue al `/health` cada 10 min.

---

## Paso 4: Frontend en Vercel

1. Cuenta en https://vercel.com (login con GitHub).
2. **Add New** → **Project** → selecciona el repo.
3. Configura:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (Vercel lo detecta solo)
   - **Output Directory**: `dist`
4. En **Environment Variables**:

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://quickrescue-api.onrender.com/api/v1` |

5. **Deploy**. En ~1 min tu web está en `https://quick-rescue-XXX.vercel.app`.
6. **Vuelve al backend en Render** y actualiza la variable `CORS_ORIGINS`
   con esa URL exacta de Vercel. Render redeplegará solo.

---

## Paso 5: Email para SOS — Resend

[Resend](https://resend.com) es lo más fácil para emails transaccionales hoy.
Free tier: **100 emails/día, 3000/mes**, sin tarjeta.

1. Cuenta en https://resend.com (login con GitHub).
2. **API Keys** → **Create API Key** → copia el valor (`re_...`).
3. Pega el valor en `RESEND_API_KEY` del backend en Render.
4. Sin dominio propio puedes usar el remitente `onboarding@resend.dev`.
   Si tienes dominio, lo verificas y usas tu propio `from`.

> Alternativa si prefieres SMTP: **Mailtrap** (test) o **Brevo** (300/día gratis).

---

## Paso 6: Compilación automática del APK con GitHub Actions

El workflow `.github/workflows/build-apk.yml` ya está incluido.

**Para generar un APK nuevo:**
```bash
git tag v1.0.0
git push origin v1.0.0
```

Eso dispara el workflow, que:
1. Instala Flutter en un runner Linux.
2. Inyecta `API_BASE_URL` apuntando a tu backend de Render.
3. Compila `flutter build apk --release`.
4. Sube el `.apk` como un **GitHub Release** descargable.

**URL pública del APK:**
```
https://github.com/<usuario>/quick-rescue/releases/latest/download/quick-rescue.apk
```

Esa URL es la que compartes a tus usuarios para que descarguen e instalen
(activando "Orígenes desconocidos" en su Android).

### Variables que debes definir en GitHub
En tu repo: **Settings → Secrets and variables → Actions → New repository secret**:

| Nombre | Valor |
|---|---|
| `API_BASE_URL` | `https://quickrescue-api.onrender.com/api/v1` |
| `MAPS_API_KEY` | tu key de Google Maps (sacar en Google Cloud Console) |

---

## 🔄 Mantenimiento

### Actualizar la app
- **Backend/Frontend**: cualquier `git push` a `main` redespliega automáticamente.
- **APK**: nuevo `git tag vX.Y.Z` y push, GitHub Actions hace el resto.

### Backup de la base de datos (importante en plan free)
La DB free de Render **se borra a los 90 días si no la usas o pasados 90 días
desde su creación**. Hacer backups manuales:

```bash
# Sustituye con la External Database URL de Render
pg_dump "postgres://user:pass@host:5432/db" > backup-$(date +%F).sql
```

Alternativa: contratar el plan Starter de Render Postgres ($7/mes) que es
permanente y tiene backups diarios.

---

## 💡 Alternativas si quieres MySQL en vez de PostgreSQL

Si prefieres **MySQL** (más familiar, igual al schema original):

1. **Aiven**: https://aiven.io/free-mysql-database
   - Free para siempre, MySQL 1 GB, backups, multi-usuario.
   - Crea cuenta, "Create service" → MySQL → Free Plan.
   - Copia la **Service URI** (formato `mysql://...`) y úsala como `DATABASE_URL`
     en Render.
2. El backend **detecta automáticamente** si la URL empieza por `mysql://`
   o `postgres://` y usa el dialect correcto. No necesitas tocar código.
3. Carga el schema con `database/schema.mysql.sql` en lugar del de Postgres.

---

## 🆘 Troubleshooting

| Problema | Solución |
|---|---|
| Render dice "Application failed to respond" | El primer request tras 15 min de sueño tarda ~30s. Espera y reintenta. |
| CORS error en el browser | Verifica que `CORS_ORIGINS` en Render incluye exactamente la URL de Vercel (con `https://` y sin slash final). |
| `psql: command not found` | Instala PostgreSQL client local: `sudo apt install postgresql-client` (Linux) o `brew install libpq` (macOS). |
| El APK no se instala en Android | Activar "Instalar apps de orígenes desconocidos" en Configuración → Seguridad. |
| GitHub Actions falla compilando APK | Revisar logs. Lo más común: falta `MAPS_API_KEY` como secret. |

---

## 💰 Cuándo pagar

Mientras estés en MVP/pruebas: **$0/mes**.

Cuando tengas tracción real, los upgrades inteligentes son:
1. **Render Web Service Starter** ($7/mes) → quita el cold-start.
2. **Render Postgres Starter** ($7/mes) → DB permanente con backups.
3. **Dominio propio** (~$12/año en Namecheap) → `quickrescue.pe` en lugar de `*.vercel.app`.

Total realista para producción: **~$15/mes**.
