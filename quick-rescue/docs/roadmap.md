# Roadmap — Quick Rescue

## Fase 0: Scaffolding (✅ HECHO)
- Estructura de monorepo (backend, frontend, mobile, docs).
- Esquema de BD funcional.
- Backend con todos los endpoints CRUD.
- Frontend con todas las páginas.
- Mobile con todas las pantallas.
- Documentación completa para que un agente IA continúe.

## Fase 1: MVP Funcional (siguiente)
**Objetivo**: que el flujo crítico (registro → SOS → email a familiar) funcione
end-to-end en un dispositivo real.

- [ ] Verificar que `npm run dev` arranca sin errores en backend y frontend.
- [ ] Verificar que `flutter run` levanta la app.
- [ ] Configurar SMTP real (Mailtrap para desarrollo, SendGrid para producción).
- [ ] Probar el flujo completo en un Android físico.
- [ ] Subir foto de perfil con `multer`.
- [ ] Agregar `Helmet` (ya está pero verificar configuración para imágenes).

## Fase 2: Producción ready
- [ ] HTTPS obligatorio.
- [ ] Refresh tokens.
- [ ] Rate limiting en `/auth/*` y `/sos`.
- [ ] Logs estructurados (pino o winston).
- [ ] Manejo de errores con monitoreo (Sentry).
- [ ] Tests: unitarios (Jest) + integración (Supertest) en backend.
- [ ] Tests de widgets en Flutter.
- [ ] CI/CD: lint + test + build en GitHub Actions.

## Fase 3: Características nuevas
- [ ] Background location en mobile (cada 15 min).
- [ ] Notificaciones push (FCM) para que el familiar no dependa solo del email.
- [ ] Mapa con histórico en frontend.
- [ ] Vista pública con QR (sin login) para que paramédicos vean info médica.
- [ ] Generación de QR físico imprimible para pulsera/llavero.
- [ ] Filtros geográficos: alerta solo si el usuario sale de "zona segura".

## Fase 4: Escala
- [ ] Modo offline en mobile con cola de sincronización.
- [ ] Internacionalización (es/en).
- [ ] Panel admin con métricas.
- [ ] Multi-tenant (varios usuarios bajo un mismo "cuidador").
- [ ] App para familiar (recibe alertas en lugar de solo email).
- [ ] Integración con servicios de emergencia (105 en Perú).

## Cómo proponer una feature nueva
1. Abrir issue describiendo el problema (no la solución).
2. Discutir.
3. Si se aprueba, añadirla a la fase correspondiente en este archivo.
4. Crear branch `feature/<nombre>`.
5. PR con descripción + actualización de `docs/api-spec.yaml` si toca el contrato.
