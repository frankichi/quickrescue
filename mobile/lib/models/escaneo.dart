class Escaneo {
  final int id;
  final String tipo; // usuario | familiar | mascota
  final int referenciaId;
  final String nombreReferencia;
  final double? latitud;
  final double? longitud;
  final DateTime creadoEn;

  Escaneo({
    required this.id,
    required this.tipo,
    required this.referenciaId,
    required this.nombreReferencia,
    required this.creadoEn,
    this.latitud, this.longitud,
  });

  factory Escaneo.fromJson(Map<String, dynamic> j) => Escaneo(
    id:               (j['id'] as num).toInt(),
    tipo:             j['tipo'] as String,
    referenciaId:     (j['referencia_id'] as num).toInt(),
    nombreReferencia: j['nombre_referencia'] as String,
    latitud:  j['latitud']  == null ? null : double.parse(j['latitud'].toString()),
    longitud: j['longitud'] == null ? null : double.parse(j['longitud'].toString()),
    creadoEn: DateTime.parse(j['creado_en'] as String),
  );
}
