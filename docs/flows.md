# Flujos de usuario — Quick Rescue

## Flujo 1: Registro y configuración inicial

```
1. Usuario abre el panel web (/register)
2. Completa: nombre, apellido, email, password, dni, fecha_nacimiento
3. Click "Crear cuenta"
   ├─► POST /auth/register
   │   └─► Crea usuario + historial_medico vacío
   └─► Recibe JWT, queda autenticado
4. Es redirigido a Dashboard
5. Va a "Mi perfil" y completa: foto, dirección, distrito, provincia
6. Va a "Historial médico" y completa: alergias, medicamentos, etc.
7. Va a "Familiares" y agrega 2-3 contactos de emergencia
```

## Flujo 2: Setup de la app móvil

```
1. Usuario instala la app
2. Pantalla Login → ingresa email + password
3. App pide permisos de:
   ├─► Ubicación (en uso)
   └─► Notificaciones
4. Pantalla Home muestra mapa con su ubicación actual
5. Cada cierto tiempo, la app envía POST /ubicaciones (TODO: en background)
```

## Flujo 3: Disparo de SOS

```
Usuario en problemas pulsa botón rojo SOS en la app móvil
   │
   ▼
App obtiene posición GPS actual
   │
   ▼
App muestra confirmación "¿Enviar SOS?"
   │
   ├── Cancelar → vuelve a Home
   │
   └── Confirmar
       │
       ▼
       POST /sos { latitud, longitud, mensaje }
       │
       ▼
       Backend:
       ├─► Inserta en `ubicaciones` con es_sos = true
       ├─► Carga lista de `familiares` del usuario
       └─► Por cada familiar con email, envía:
           "🚨 Quick Rescue Alert
            María Pérez ha activado el botón SOS.
            Última ubicación conocida: [link a Google Maps]
            Hora: 2025-04-25 14:32"
       │
       ▼
       App muestra "✓ SOS enviado a N familiares"
```

## Flujo 4: Familiar recibe el SOS

```
Familiar recibe email
   │
   ▼
Click en el link → abre Google Maps con la ubicación
   │
   ▼
Llama al usuario o va al lugar
```

## Flujo 5: Usuario revisa histórico desde el panel web

```
Usuario logueado en panel web
   │
   ▼
Click "Mis ubicaciones"
   │
   ▼
GET /ubicaciones?limit=50
   │
   ▼
Frontend muestra:
  ├─► Tabla con timestamp, lat, lng, es_sos
  └─► (TODO) Mapa con pines del histórico
```

## Flujo 6: Edición de familiares

```
Usuario en /familiares
   │
   ├── Click "Agregar familiar"
   │   ├─► Modal con form (nombre, teléfono, email, relación)
   │   └─► POST /familiares
   │
   ├── Click ícono editar en un familiar
   │   └─► PUT /familiares/{id}
   │
   └── Click ícono eliminar
       ├─► Confirmación
       └─► DELETE /familiares/{id}
```
