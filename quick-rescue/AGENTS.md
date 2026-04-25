# AGENTS.md

> **Para Antigravity / Cursor / Claude Code / Windsurf:** este archivo describe
> las convenciones de Quick Rescue. **Léelo antes de generar o modificar código.**

## Resumen del proyecto

Quick Rescue es un sistema de identificación y rescate por geolocalización.
Tiene tres componentes:

| Componente | Stack | Puerto |
|-----------|-------|--------|
| Backend   | Node 20 + Express + TypeScript + Sequelize + MySQL | 3000 |
| Frontend  | React 18 + Vite + TypeScript + Axios               | 5173 |
| Mobile    | Flutter 3.x (Dart)                                 | n/a  |

## Convenciones globales

- **Idioma**: nombres de variables, funciones, archivos y comentarios en
  **español** para mantener coherencia con el dominio del problema (es un
  proyecto local de Perú). Excepción: palabras técnicas universales (`token`,
  `request`, `controller`).
- **Comentarios**: todo método público lleva JSDoc/DartDoc. Toda función
  no-trivial tiene una línea de comentario explicando *por qué*, no *qué*.
- **Errores**: nunca tragar excepciones. Loguear y propagar con tipo claro.
- **Sin código muerto**: si está comentado se borra. Para experimentos usa una
  rama git.

## Backend (`/backend`)

### Estructura
```
src/
├── main.ts                # Bootstrap
├── app.ts                 # Express app (middlewares + rutas)
├── config/                # Configuración (DB, env, mailer)
├── controllers/           # Reciben req/res, NO tienen lógica de negocio
├── services/              # Lógica de negocio, retornan datos puros
├── routes/                # Definición de rutas + middleware
├── models/                # Modelos Sequelize
├── middleware/            # auth, error, validation
├── validators/            # Esquemas express-validator
└── utils/                 # jwt, password, logger
```

### Reglas obligatorias
1. **Controller jamás llama a un modelo directamente.** Siempre pasa por
   `service`. El controller solo: parsea input, llama service, retorna
   `res.json(...)`.
2. **Service jamás conoce `req`/`res`.** Recibe parámetros tipados y devuelve
   datos o lanza excepciones tipadas (`AppError`).
3. **Validación**: cada endpoint con body/params lleva su validador en
   `/validators`. Encadenar `validate(schema)` antes del controller.
4. **Modelos en singular y PascalCase** (`Usuario`, `Familiar`,
   `HistorialMedico`, `Ubicacion`).
5. **Endpoints REST**: `/api/v1/<recurso>` siempre con prefijo y versión.
6. **Respuestas estándar**:
   ```json
   { "success": true,  "data": ... }
   { "success": false, "error": "mensaje", "details": {...} }
   ```

### Para añadir un nuevo recurso
1. Crear modelo en `models/<recurso>.model.ts`.
2. Registrarlo en `models/index.ts`.
3. Crear servicio en `services/<recurso>.service.ts`.
4. Crear validador en `validators/<recurso>.validator.ts`.
5. Crear controlador en `controllers/<recurso>.controller.ts`.
6. Crear router en `routes/<recurso>.routes.ts`.
7. Registrar router en `routes/index.ts`.
8. Documentar en `docs/api-spec.yaml`.

## Frontend (`/frontend`)

### Estructura
```
src/
├── main.tsx               # Entry point
├── App.tsx                # Router + AuthProvider
├── components/            # Componentes reutilizables
│   └── ui/                # Botones, inputs, etc. genéricos
├── pages/                 # Una por ruta
├── services/              # Llamadas al backend (axios)
├── context/               # AuthContext, etc.
├── hooks/                 # useAuth, etc.
├── types/                 # Interfaces TypeScript compartidas
└── styles/                # CSS global
```

### Reglas obligatorias
1. **Páginas en PascalCase** (`Login.tsx`, `Dashboard.tsx`).
2. **Servicios** centralizan TODO acceso a la API. Una página jamás llama a
   `axios` directamente.
3. **Tipos**: cada entidad del backend tiene su `interface` en `types/`.
4. **Rutas protegidas**: envolver con `<ProtectedRoute>`.
5. **Estado global**: solo lo necesario va a contexto. El resto es estado local.

## Mobile (`/mobile` — Flutter)

### Estructura
```
lib/
├── main.dart                  # MaterialApp + rutas
├── config/app_config.dart     # URL del backend, claves
├── models/                    # Clases Dart de las entidades
├── services/                  # api_service, auth_service, location_service
├── screens/                   # Una pantalla por archivo
├── widgets/                   # Componentes reutilizables
└── utils/                     # Constantes, helpers
```

### Reglas obligatorias
1. **Snake_case** para nombres de archivo (`login_screen.dart`), **PascalCase**
   para clases.
2. **Pantallas** terminan en `Screen` (`LoginScreen`, `MapScreen`).
3. **Sin lógica HTTP en widgets.** Todo va por `services/`.
4. **Permisos**: pedirlos justo antes de usarlos, no en `main()`.

## Modelo de datos (canónico)

Ver `docs/database-schema.sql`. Resumen:

- **usuarios**: cuenta + perfil del titular (es la persona a rescatar y a la
  vez quien se loguea).
- **familiares**: contactos de emergencia del usuario (1 usuario → N familiares).
- **historial_medico**: alergias, enfermedades, operaciones (1 usuario → 1
  historial; relación 1-a-1).
- **ubicaciones**: histórico de geolocalización (1 usuario → N ubicaciones,
  insertadas por la app móvil cada cierto tiempo o cuando se pulsa SOS).

## Qué NO hacer

- ❌ Mezclar lógica de negocio en controllers.
- ❌ Llamar fetch/axios desde una página de React (siempre vía `services/`).
- ❌ Hardcodear URLs, secrets o API keys. Todo va en `.env`.
- ❌ Crear nuevas dependencias sin justificarlo en el commit.
- ❌ Romper el contrato de `docs/api-spec.yaml` sin actualizarlo en el mismo PR.
- ❌ Asumir que el usuario es admin: no hay rol admin todavía. Si se necesita,
  añadirlo como tarea en `docs/roadmap.md` primero.

## Próximas tareas (snapshot)

Ver `docs/ai-context.md` para la lista priorizada y actualizada.

Última actualización del scaffolding: ver fecha del commit inicial.
