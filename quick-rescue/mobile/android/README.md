# Android — Notas

Los archivos faltantes (`build.gradle`, `MainActivity.kt`, `styles.xml`,
`launch_background.xml`, etc.) son generados automáticamente por Flutter
la primera vez que ejecutes:

```bash
cd mobile
flutter create .
```

Eso completará el scaffold sin sobrescribir el `AndroidManifest.xml`
ya configurado con los permisos y la entrada de Google Maps.

**No olvides**: editar `android/app/src/main/AndroidManifest.xml` y
reemplazar `YOUR_MAPS_API_KEY` con tu API key real de Google Maps,
o configurar el secret `MAPS_API_KEY` en GitHub Actions para que se
inyecte automáticamente en cada build.
