# Funcionalidades — Quick Rescue

## ✅ Implementadas en el scaffolding

### Autenticación
- [x] Registro de usuario con email + password
- [x] Login con JWT
- [x] Endpoint `/auth/me` para validar sesión
- [x] Hash de contraseñas con bcrypt

### Gestión de usuario
- [x] CRUD de perfil (`GET/PUT/DELETE /usuarios/me`)
- [x] Campos: nombre, apellido, dni, email, foto, fecha_nacimiento,
      direccion, distrito, provincia

### Familiares (contactos de emergencia)
- [x] CRUD completo (`/familiares`)
- [x] Validación de pertenencia (no se puede ver/editar familiares de otro usuario)

### Historial médico
- [x] Lectura y actualización (`GET/PUT /historial-medico`)
- [x] Se crea automáticamente al registrar un usuario (vacío)
- [x] Campos: alergias, enfermedades, operaciones, medicamentos, grupo_sanguineo

### Geolocalización
- [x] Endpoint para reportar ubicación (`POST /ubicaciones`)
- [x] Listado del histórico (`GET /ubicaciones?limit=N`)
- [x] App móvil obtiene GPS y envía ubicación al backend
- [x] Mapa en la app móvil con la ubicación actual

### Botón SOS
- [x] Endpoint `POST /sos` que:
  - inserta una ubicación con `es_sos = TRUE`
  - dispara email a todos los familiares con link a Google Maps

### Seguridad
- [x] JWT en `Authorization: Bearer <token>`
- [x] Validación de inputs con `express-validator`
- [x] CORS configurable
- [x] Helmet activado
- [x] Sin secretos hardcodeados

## 🚧 Pendientes (ver `docs/roadmap.md`)

- [ ] Subida real de foto (multer + storage)
- [ ] Refresh tokens
- [ ] Rate limiting
- [ ] Notificaciones push (FCM)
- [ ] Background location en mobile
- [ ] Mapa con histórico en frontend
- [ ] Vista pública con QR
- [ ] Tests automatizados
- [ ] CI/CD
