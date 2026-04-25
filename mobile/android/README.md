# Android — Notas

Los archivos faltantes (`build.gradle`, `MainActivity.kt`, `styles.xml`,
`launch_background.xml`, etc.) son generados automáticamente por Flutter
la primera vez que ejecutes:

```bash
cd mobile
flutter create .
```

Eso completará el scaffold sin sobrescribir el `AndroidManifest.xml`
ya configurado con los permisos.

El workflow de CI (`.github/workflows/build-apk.yml`) ejecuta
`flutter create .` antes de `flutter pub get`, así que en cada build de
GitHub Actions estos archivos se regeneran automáticamente.

## Sobre el mapa
Quick Rescue ya **no usa Google Maps**: el mapa es OpenStreetMap a través
de `flutter_map`, lo que elimina la necesidad de API key, billing y de
configurar nada extra en el `AndroidManifest.xml`.
