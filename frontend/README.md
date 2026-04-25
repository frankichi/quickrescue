# Quick Rescue — Frontend

Panel web del titular del usuario. Construido con React 18 + Vite + TypeScript.

## Desarrollo local

```bash
cp .env.example .env       # VITE_API_URL apunta al backend local por defecto
npm install
npm run dev                 # http://localhost:5173
```

## Build producción

```bash
npm run build              # genera /dist
```

## Estructura

```
src/
├── main.tsx               Bootstrap + AuthProvider + Router
├── App.tsx                Definición de rutas
├── components/            Layout, ProtectedRoute
├── pages/                 Una por ruta (Login, Register, Dashboard, ...)
├── services/              Cliente axios + 1 service por recurso
├── context/AuthContext    Estado global de sesión
├── types/                 Interfaces compartidas con el backend
└── styles/global.css      Estilos base (sin framework CSS)
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL completa de la API. Ej: `https://quickrescue-api.onrender.com/api/v1` |

## Despliegue en Vercel

Ver `docs/deployment.md` en la raíz. En resumen:
1. Conecta el repo a Vercel.
2. Root Directory: `frontend`.
3. Define `VITE_API_URL` en las env vars.
4. Listo.
